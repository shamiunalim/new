package com.maxiel.floating
import android.app.*;import android.content.*;import android.graphics.*;import android.graphics.drawable.*;import android.os.*;import android.view.*;import android.widget.*;import kotlin.math.*
class OverlayService:Service(){
 lateinit var wm:WindowManager;lateinit var root:FrameLayout;lateinit var dot:TextView;var size=72;var menu:LinearLayout?=null
 var dx=0f;var dy=0f;var sx=0;var sy=0
 override fun onCreate(){super.onCreate();startForeground(7,notif());wm=getSystemService(WINDOW_SERVICE) as WindowManager
  root=FrameLayout(this);dot=TextView(this);dot.text="●";dot.textSize=30f;dot.gravity=Gravity.CENTER;dot.setTextColor(Color.WHITE);dot.background=circle("#2563EB")
  dot.setOnTouchListener{_,e->val p=root.tag as WindowManager.LayoutParams;when(e.action){MotionEvent.ACTION_DOWN->{dx=e.rawX;dy=e.rawY;sx=p.x;sy=p.y;true};MotionEvent.ACTION_MOVE->{p.x=sx+(e.rawX-dx).toInt();p.y=sy+(e.rawY-dy).toInt();wm.updateViewLayout(root,p);true};MotionEvent.ACTION_UP->{toggle();true};else->false}}
  root.addView(dot,FrameLayout.LayoutParams(size,size))
  val p=WindowManager.LayoutParams(size,size,WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,PixelFormat.TRANSLUCENT);p.gravity=Gravity.TOP or Gravity.START;p.x=30;p.y=250;root.tag=p;wm.addView(root,p)}
 fun circle(c:String)=GradientDrawable().apply{shape=GradientDrawable.OVAL;setColor(Color.parseColor(c));setStroke(2,Color.WHITE)}
 fun toggle(){if(menu!=null){root.removeView(menu);menu=null;return};val m=LinearLayout(this);m.orientation=LinearLayout.VERTICAL;m.setPadding(8,8,8,8);m.setBackgroundColor(Color.argb(245,17,24,39))
  fun b(t:String,f:()->Unit){val x=Button(this);x.text=t;x.setOnClickListener{f()};m.addView(x)}
  b("SS / Screenshot"){Toast.makeText(this,"Screenshot membutuhkan izin MediaProjection Android.",Toast.LENGTH_LONG).show()}
  b("REKAM LAYAR"){Toast.makeText(this,"Rekam layar membutuhkan persetujuan sistem Android.",Toast.LENGTH_LONG).show()}
  b("Ukuran +"){size=min(140,size+12);resize()};b("Ukuran -"){size=max(44,size-12);resize()};b("Tutup overlay"){stopSelf()}
  root.addView(m,FrameLayout.LayoutParams(230,FrameLayout.LayoutParams.WRAP_CONTENT).apply{leftMargin=size+10});menu=m}
 fun resize(){val p=root.layoutParams;p.width=size;p.height=size;root.layoutParams=p;dot.layoutParams=FrameLayout.LayoutParams(size,size)}
 fun notif():Notification{val id="maxiel";if(Build.VERSION.SDK_INT>=26)(getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(NotificationChannel(id,"Maxiel Floating",NotificationManager.IMPORTANCE_LOW));return Notification.Builder(this,id).setContentTitle("Maxiel Floating").setContentText("Kontrol mengambang aktif").setSmallIcon(android.R.drawable.ic_menu_view).build()}
 override fun onBind(i:Intent?)=null;override fun onDestroy(){try{wm.removeView(root)}catch(_:Exception){};super.onDestroy()}
}