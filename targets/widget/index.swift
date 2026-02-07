import WidgetKit
import SwiftUI
import os.log

// MARK: - Widget Bundle Entry

private let logger = Logger(subsystem: "com.sahiljadhav.syngo.widget", category: "Widget")

@main
struct SyngoWidgetBundle: WidgetBundle {
    
    init() {
        logger.info("🚀 SyngoWidgetBundle initialized!")
        print("🚀 [SyngoWidget] Widget bundle initialized")
    }
    
    var body: some Widget {
        // Home Screen Widgets - Small
        PartnerStatusWidget()
        MoodWidget()
        DaysTogetherWidget()  // NEW - replaces QuickNudgeWidget
        
        // Home Screen Widgets - Medium
        QuickActionsWidget()
        CoupleCardWidget()    // NEW
        
        // Home Screen Widgets - Large
        DashboardWidget()
        CoupleOverviewWidget()
        
        // Lock Screen Widgets
        PartnerMoodAccessory()
        PartnerStatusAccessory()
        DaysTogetherAccessory()  // NEW - replaces NudgeInlineAccessory
    }
}
