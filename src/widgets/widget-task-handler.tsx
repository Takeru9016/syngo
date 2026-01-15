"use no memo";
/**
 * Widget Task Handler
 *
 * Background task handler for Android widgets.
 * Called when widgets need to be rendered/updated.
 *
 * NOTE: "use no memo" disables React Compiler for this file.
 */

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerWidgetTaskHandler,
  type WidgetTaskHandlerProps,
} from "react-native-android-widget";
import {
  WidgetData,
  createEmptyWidgetData,
  WIDGET_DATA_KEY,
} from "../types/widget-data.types";
import {
  PartnerStatusWidget,
  MoodWidget,
  QuickNudgeWidget,
  QuickActionsWidget,
  FullDashboardWidget,
  CoupleOverviewWidget,
} from "./SyngoWidgets";

/**
 * Load widget data from AsyncStorage with fallback
 */
async function loadWidgetData(): Promise<WidgetData> {
  try {
    const jsonString = await AsyncStorage.getItem(`widget:${WIDGET_DATA_KEY}`);
    if (jsonString) {
      const parsed = JSON.parse(jsonString) as WidgetData;
      // Validate required fields
      if (parsed && typeof parsed.isPaired === "boolean") {
        return parsed;
      }
    }
  } catch (error) {
    // Silently fail and return empty data
    console.log("Widget: Failed to load data, using empty state");
  }
  return createEmptyWidgetData();
}

/**
 * Get widget component based on widget name
 */
function getWidgetComponent(
  widgetName: string,
  data: WidgetData,
): React.JSX.Element {
  try {
    switch (widgetName) {
      case "SyngoPartnerStatus":
        return <PartnerStatusWidget data={data} />;

      case "SyngoMood":
        return <MoodWidget data={data} />;

      case "SyngoQuickNudge":
        return <QuickNudgeWidget data={data} />;

      case "SyngoQuickActions":
        return <QuickActionsWidget data={data} />;

      case "SyngoDashboard":
        return <FullDashboardWidget data={data} />;

      case "SyngoCoupleOverview":
        return <CoupleOverviewWidget data={data} />;

      default:
        // Fallback to partner status widget
        return <PartnerStatusWidget data={data} />;
    }
  } catch (error) {
    // Return a simple fallback widget if component fails
    return <PartnerStatusWidget data={createEmptyWidgetData()} />;
  }
}

/**
 * Register the widget task handler
 *
 * The handler receives props with:
 * - widgetInfo: { widgetName, widgetId }
 * - widgetAction: 'WIDGET_ADDED' | 'WIDGET_UPDATE' | 'WIDGET_RESIZED' | 'WIDGET_DELETED' | 'WIDGET_CLICK'
 * - renderWidget: callback function to render the widget
 */
registerWidgetTaskHandler(async (props: WidgetTaskHandlerProps) => {
  const { widgetInfo, widgetAction, renderWidget } = props;

  // Don't render if widget was deleted
  if (widgetAction === "WIDGET_DELETED") {
    return;
  }

  try {
    // Load data and get widget component
    const data = await loadWidgetData();
    const widget = getWidgetComponent(widgetInfo.widgetName, data);

    // Render the widget using the callback
    renderWidget(widget);
  } catch (error) {
    // Fallback: render empty state widget if anything fails
    console.log("Widget: Error rendering, using fallback");
    const fallbackData = createEmptyWidgetData();
    renderWidget(<PartnerStatusWidget data={fallbackData} />);
  }
});
