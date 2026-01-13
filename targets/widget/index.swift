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
        // Note: These widgets already have @available(iOS 16.0, *) on their definition,
        // so they will only be active on iOS 16+
        PartnerMoodAccessoryWidget()
        PartnerStatusAccessoryWidget()
        NudgeInlineWidget()
    }
}
