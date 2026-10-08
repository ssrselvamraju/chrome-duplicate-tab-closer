#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
# Original geometric artwork: overlapping tabs and a check mark.
for size in (16,32,48,128):
    im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((8,8,248,248),radius=54,fill='#075c56')
    d.rounded_rectangle((52,54,190,176),radius=16,outline='#9fd6ca',width=11)
    d.rounded_rectangle((78,82,216,204),radius=16,fill='#ffffff')
    d.line([(108,145),(133,170),(184,119)],fill='#075c56',width=16)
    scaled=im.resize((96,96) if size==128 else (size,size),Image.Resampling.LANCZOS)
    if size==128:
        padded=Image.new('RGBA',(128,128),(0,0,0,0));padded.alpha_composite(scaled,(16,16));scaled=padded
    scaled.save(root/f'icons/icon{size}.png')
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
im=Image.new('RGB',(440,280),'#075c56'); d=ImageDraw.Draw(im)
d.text((26,30),'400+ tabs?',font=ImageFont.truetype(fontpath,38),fill='white')
d.text((26,105),'Close duplicate tabs.',font=ImageFont.truetype(fontpath,27),fill='white')
d.text((26,164),'Local. Private. Open source.',font=ImageFont.truetype(fontpath,22),fill='#c2eae2')
d.text((26,227),'Duplicate Tab Closer',font=ImageFont.truetype(fontpath,20),fill='white')
im.save(root/'store/promo-440x280.png')
