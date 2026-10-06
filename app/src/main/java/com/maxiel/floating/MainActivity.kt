package com.maxiel.floating
import android.app.*;import android.content.*;import android.net.Uri;import android.os.*;import android.provider.Settings;import android.view.*;import android.widget.*
class MainActivity:Activity(){
 override fun onCreate(b:Bundle?){super.onCreate(b)
  val l=LinearLayout(this);l.orientation=LinearLayout.VERTICAL;l.setPadding(30,30,30,30)
  fun btn(t:String,f:()->Unit){val x=Button(this);x.text=t;x.setOnClickListener{f()};l.addView(x)}
  val s=TextView(this);s.text="Maxiel Floating\nDiciptakan oleh Maxiel Nuoye";s.textSize=24f;l.addView(s)
  btn("Izinkan tampil di atas aplikasi lain"){startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,Uri.parse("package:$packageName")))}
  btn("Aktifkan tombol mengambang"){if(Settings.canDrawOverlays(this)){startForegroundService(Intent(this,OverlayService::class.java));s.text="Overlay aktif. Buka aplikasi lain untuk mencobanya."}else s.text="Berikan izin overlay terlebih dahulu."}
  btn("Nonaktifkan overlay"){stopService(Intent(this,OverlayService::class.java))}
  val i=TextView(this);i.text="\nTombol bulat dapat diseret seperti analog. Ketuk untuk menu. Ukuran dapat diubah. Screenshot/rekam layar tetap memerlukan persetujuan sistem Android.";l.addView(i);setContentView(l)}
}