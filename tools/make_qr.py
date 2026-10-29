"""Usage: python tools/make_qr.py https://YOUR-USER.github.io/YOUR-REPO/"""
import sys,os,csv,json,re
from urllib.parse import urlencode
import qrcode
if len(sys.argv)<2 or not sys.argv[1].startswith('https://'):raise SystemExit('HTTPSの公開URLを指定してください。')
base=sys.argv[1].split('?')[0].rstrip('/')+'/'
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config=open(os.path.join(root,'config.js'),encoding='utf-8').read()
codes=dict(re.findall(r'"((?:room|testimony)-\d{2})": "([A-Z0-9]{6})"',config))
folder=os.path.join(root,'qr_codes');os.makedirs(folder,exist_ok=True)
with open(os.path.join(folder,'qr_mapping.csv'),'w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['情報ID','解放コード','QRリンク'])
 for id,code in codes.items():
  if id=='testimony-07':continue
  url=base+'?'+urlencode({'unlock':code});qrcode.make(url).save(os.path.join(folder,id+'.png'));w.writerow([id,code,url])
print('QRコード生成完了。執事の証言は電話専用です。')
