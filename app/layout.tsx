import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'鋼製床 支持台・ボルト組選定',description:'KIRII GTフロアー／GTダイレクトの支持台・ボルト組を高さから選定',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'鋼製床選定'},icons:{apple:'/icon-192.png',icon:'/icon-192.png'},openGraph:{title:'鋼製床 支持台・ボルト組 かんたん選定',description:'高さを入力して、標準組合せをすぐ確認。',images:['/opengraph-image.png']}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#102a43'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
