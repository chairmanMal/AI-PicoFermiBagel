import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure audio session to play even when device is in silent mode
        print("🔊 Starting audio session configuration...")
        
        // Add audio session interruption observer
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioSessionInterruption),
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        do {
            // Log current audio session state before configuration
            let currentCategory = AVAudioSession.sharedInstance().category
            let currentMode = AVAudioSession.sharedInstance().mode
            let isActive = AVAudioSession.sharedInstance().isOtherAudioPlaying
            
            print("🔊 Current audio session - Category: \(currentCategory), Mode: \(currentMode), Other audio playing: \(isActive)")
            
            // First, deactivate any existing session to avoid conflicts
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            print("🔊 ✅ Deactivated existing audio session")
            
            // Use .playback category with minimal options to avoid conflicts
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
            print("🔊 ✅ Audio session category set to .playback with default options")
            
            // Activate the audio session
            try AVAudioSession.sharedInstance().setActive(true, options: .notifyOthersOnDeactivation)
            print("🔊 ✅ Audio session activated successfully")
            
            // Log final configuration
            let finalCategory = AVAudioSession.sharedInstance().category
            let finalMode = AVAudioSession.sharedInstance().mode
            let finalOptions = AVAudioSession.sharedInstance().categoryOptions
            
            print("🔊 ✅ Final audio session configuration:")
            print("🔊    Category: \(finalCategory)")
            print("🔊    Mode: \(finalMode)")
            print("🔊    Options: \(finalOptions)")
            print("🔊    Sample Rate: \(AVAudioSession.sharedInstance().sampleRate)")
            print("🔊 ✅ Audio session configured for silent mode playback")
            
        } catch {
            print("🔊 ❌ Failed to configure audio session: \(error)")
            print("🔊 ❌ Error details: \(error.localizedDescription)")
            if let nsError = error as NSError? {
                print("🔊 ❌ Error code: \(nsError.code)")
                print("🔊 ❌ Error domain: \(nsError.domain)")
            }
            
            // Try a fallback configuration
            do {
                print("🔊 🔄 Attempting fallback audio session configuration...")
                try AVAudioSession.sharedInstance().setCategory(.playback)
                try AVAudioSession.sharedInstance().setActive(true)
                print("🔊 ✅ Fallback audio session configuration successful")
            } catch {
                print("🔊 ❌ Fallback configuration also failed: \(error)")
            }
        }
        
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        print("🔊 App became active - checking audio session...")
        
        // Re-activate audio session when app becomes active
        do {
            let currentCategory = AVAudioSession.sharedInstance().category
            
            print("🔊 Before reactivation - Category: \(currentCategory)")
            
            // Ensure we have the correct category set
            if currentCategory != .playback {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
                print("🔊 ✅ Reset audio session category to .playback")
            }
            
            try AVAudioSession.sharedInstance().setActive(true)
            print("🔊 ✅ Audio session reactivated successfully")
            
        } catch {
            print("🔊 ❌ Failed to reactivate audio session: \(error)")
            print("🔊 ❌ Reactivation error details: \(error.localizedDescription)")
            if let nsError = error as NSError? {
                print("🔊 ❌ Reactivation error code: \(nsError.code)")
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    @objc func handleAudioSessionInterruption(notification: Notification) {
        print("🔊 🔄 Audio session interruption received")
        
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }
        
        switch type {
        case .began:
            print("🔊 🔄 Audio session interruption began")
        case .ended:
            print("🔊 🔄 Audio session interruption ended")
            // Reactivate audio session after interruption
            do {
                try AVAudioSession.sharedInstance().setActive(true, options: .notifyOthersOnDeactivation)
                print("🔊 ✅ Audio session reactivated after interruption")
            } catch {
                print("🔊 ❌ Failed to reactivate audio session after interruption: \(error)")
            }
        @unknown default:
            print("🔊 ❓ Unknown audio session interruption type")
        }
    }

}
