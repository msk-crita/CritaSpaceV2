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
        className="flex gap-1 overflow-x-auto border-b border-border"
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
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              value === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
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
