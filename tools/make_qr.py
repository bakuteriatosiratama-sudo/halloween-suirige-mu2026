"""Usage: python tools/make_qr.py https://YOUR-USER.github.io/YOUR-REPO/"""
import sys,os,csv
from urllib.parse import urlencode
try:import qrcode
except ImportError:raise SystemExit('pip install qrcode[pil] を実行してください。')
if len(sys.argv)<2 or not sys.argv[1].startswith('https://'):raise SystemExit('HTTPSの公開URLを引数に指定してください。')
base=sys.argv[1].split('?')[0].rstrip('/')+'/'
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ids=[f'room-{i:02d}' for i in range(1,24)]+[f'testimony-{i:02d}' for i in range(1,9) if i!=7]
folder=os.path.join(root,'qr_codes');os.makedirs(folder,exist_ok=True)
with open(os.path.join(folder,'qr_mapping.csv'),'w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['コード','QRリンク'])
 for id in ids:
  url=base+'?'+urlencode({'unlock':id});qrcode.make(url).save(os.path.join(folder,id+'.png'));w.writerow([id,url])
print(f'{len(ids)} 件のQRコードを生成しました: {folder}')
print('執事の証言（testimony-07）は電話専用のためQRを作成していません。')
