
# ElderCare Connect - Master Build Guide (Version 2.0)

## ✅ SUCCESS: Your code is ready for Android
This version includes the latest updates: **Matrix Number validation**, **Large Text Accessibility**, and **Optimized Chat permissions**.

## 🚀 Step-by-Step APK Generation

### 1. Update your local machine
On your computer (VS Code), run these commands to get the latest code from Firebase Studio:
```bash
git reset --hard origin/main
npm install
```

### 2. Build the Static Web Files
Next.js will generate the `out` folder containing your optimized app code:
```bash
npm run build
```

### 3. Sync with Android
This pushes the new code into the Android project folder:
```bash
npx cap sync android
```

### 4. Generate the APK in Android Studio
1. Run: `npx cap open android`
2. Wait for the **Gradle Sync** bar at the bottom to finish.
3. In the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. When the popup appears in the bottom-right, click **Locate**.
5. Find your `app-debug.apk` and transfer it to your phone!

## 🔐 Admin Credentials
- **Admin Email**: `adminkn@gmail.com`
- **Initial Password**: `knadmin123`
