import WidgetKit
import SwiftUI

@main
struct SyngoWidgetBundle: WidgetBundle {
    var body: some Widget {
        // Home Screen Widgets
        PartnerStatusWidget()
        MoodWidget()
        QuickNudgeWidget()
        QuickActionsWidget()
        FullDashboardWidget()
        CoupleOverviewWidget()
        
        // Lock Screen Widgets (iOS 16+)
        if #available(iOS 16.0, *) {
            PartnerMoodAccessoryWidget()
            PartnerStatusAccessoryWidget()
            NudgeInlineWidget()
        }
    }
}
