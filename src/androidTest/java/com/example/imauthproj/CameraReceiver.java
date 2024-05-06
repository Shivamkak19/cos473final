package com.example.imauthproj;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.provider.MediaStore;
import android.util.Log;
import com.chaquo.python.Python;
import com.chaquo.python.PyObject;

public class CameraReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action != null && action.equals(MediaStore.ACTION_IMAGE_CAPTURE)) {
            // Extract the file URI from the Intent
            Log.i("CameraEventReceiver", "New photo taken: " + intent.getData());
            // Trigger the blockchain interaction
            Bitmap photoBitmap = intent.getParcelableExtra("data");
            String hash = triggerTransmissionFunction(photoBitmap);
            }
        }

    private String triggerTransmissionFunction(Bitmap image){
        Python py = Python.getInstance();
        PyObject pyObject = py.getModule("hashImage"); // Your Python file name without .py extension

        PyObject hasher = pyObject.callAttr("hashImage");

        String hash = hasher.callAttr("generate_pixel_hash", image).toString();
        return hash;
    }
}
