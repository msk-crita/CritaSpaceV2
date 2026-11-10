import type { ReactNode } from "react";

export interface TabItem {
  label: string;
  value: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function Tabs({ tabs, value, onChange, className = "" }: TabsProps) {
  const activeTab = tabs.find((tab) => tab.value === value);

  return (
    <div className={className}>
      <div
        role="tablist"
        className={[
          "flex gap-1 overflow-x-auto rounded-xl border border-border",
          "bg-surface-secondary/50 p-1",
          "shadow-[inset_2px_2px_5px_rgba(3,63,45,0.05)]",
        ].join(" ")}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`tab-${tab.value}`}
            aria-selected={value === tab.value}
            aria-controls={`panel-${tab.value}`}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={[
              "shrink-0 rounded-lg px-4 py-2.5",
              "text-sm font-medium transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-40",
              value === tab.value
                ? [
                    "border border-border/70 bg-surface text-primary",
                    "shadow-[2px_2px_5px_rgba(3,63,45,0.09),-2px_-2px_5px_rgba(255,255,255,0.5)]",
                    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2)]",
                  ].join(" ")
                : "text-text-secondary hover:text-text-primary hover:bg-surface/50",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab && (
        <div
          role="tabpanel"
          id={`panel-${activeTab.value}`}
          aria-labelledby={`tab-${activeTab.value}`}
          className="pt-4"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
