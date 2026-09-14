import torch
import torch.nn as nn

class LayerNorm2d(nn.Module):
    def __init__(self, num_channels, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(num_channels))
        self.bias   = nn.Parameter(torch.zeros(num_channels))
        self.eps    = eps

    def forward(self, x):
        u = x.mean(1, keepdim=True)
        s = (x - u).pow(2).mean(1, keepdim=True)
        x = (x - u) / torch.sqrt(s + self.eps)
        return self.weight[:, None, None] * x + self.bias[:, None, None]


class SimpleGate(nn.Module):
    def forward(self, x):
        x1, x2 = x.chunk(2, dim=1)
        return x1 * x2


class NAFBlock(nn.Module):
    def __init__(self, c, dw_expand=2, ffn_expand=2):
        super().__init__()
        dw_ch = c * dw_expand
        self.norm1   = LayerNorm2d(c)
        self.conv1   = nn.Conv2d(c, dw_ch, 1)
        self.conv2   = nn.Conv2d(dw_ch, dw_ch, 3, padding=1, groups=dw_ch)
        self.sg1     = SimpleGate()
        self.sca     = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(dw_ch // 2, dw_ch // 2, 1),
        )
        self.conv3   = nn.Conv2d(dw_ch // 2, c, 1)

        ffn_ch = c * ffn_expand
        self.norm2   = LayerNorm2d(c)
        self.conv4   = nn.Conv2d(c, ffn_ch, 1)
        self.sg2     = SimpleGate()
        self.conv5   = nn.Conv2d(ffn_ch // 2, c, 1)

        self.beta  = nn.Parameter(torch.ones((1, c, 1, 1)))
        self.gamma = nn.Parameter(torch.ones((1, c, 1, 1)))

    def forward(self, inp):
        x = self.norm1(inp)
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.sg1(x)
        x = x * self.sca(x)
        x = self.conv3(x)
        y = inp + x * self.beta

        x = self.norm2(y)
        x = self.conv4(x)
        x = self.sg2(x)
        x = self.conv5(x)
        return y + x * self.gamma


class NAFNet(nn.Module):
    def __init__(self, img_channel=1, width=16, middle_blk_num=4,
                 enc_blks=[1, 1, 2, 4], dec_blks=[1, 1, 2, 4]):
        super().__init__()
        self.intro = nn.Conv2d(img_channel, width, 3, padding=1)

        self.encoders    = nn.ModuleList()
        self.downs       = nn.ModuleList()
        chan = width
        for num in enc_blks:
            self.encoders.append(nn.Sequential(*[NAFBlock(chan) for _ in range(num)]))
            self.downs.append(nn.Conv2d(chan, chan * 2, 2, stride=2))
            chan *= 2

        self.middle_blks = nn.Sequential(*[NAFBlock(chan) for _ in range(middle_blk_num)])

        self.decoders = nn.ModuleList()
        self.ups       = nn.ModuleList()
        for num in dec_blks:
            self.ups.append(nn.Sequential(
                nn.Conv2d(chan, chan * 2, 1),
                nn.PixelShuffle(2)
            ))
            chan //= 2
            self.decoders.append(nn.Sequential(*[NAFBlock(chan) for _ in range(num)]))

        self.ending = nn.Conv2d(width, img_channel, 3, padding=1)

    def forward(self, inp):
        x = self.intro(inp)
        encoder_outs = []
        for encoder, down in zip(self.encoders, self.downs):
            x = encoder(x)
            encoder_outs.append(x)
            x = down(x)

        x = self.middle_blks(x)

        for decoder, up, enc_skip in zip(self.decoders, self.ups, reversed(encoder_outs)):
            x = up(x)
            x = x + enc_skip
            x = decoder(x)

        x = self.ending(x)
        return inp + x