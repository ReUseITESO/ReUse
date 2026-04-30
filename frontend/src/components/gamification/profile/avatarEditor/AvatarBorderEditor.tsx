import { useState } from 'react';
import CustomTab from './CustomTab';
import DesignTab from './DesignsTab';

function TabIndex(props: { setActiveTab: (tab: string) => void; activeTab: string }) {
  const { setActiveTab, activeTab } = props;

  const tabs = [
    { id: 'custom', label: 'Custom' },
    { id: 'designs', label: 'Diseños' },
    { id: 'others', label: 'Otros' },
  ];

  return (
    <ul className="flex p-1 gap-1 w-full rounded-full bg-primary/10 border border-primary/10 backdrop-blur-sm">
      {tabs.map(tab => (
        <li key={tab.id} className="flex-1">
          <button
            onClick={() => setActiveTab(tab.id)}
            className={`w-full py-2 text-sm font-medium rounded-full transition-all duration-200
                        ${
                          activeTab === tab.id
                            ? 'bg-primary text-white shadow-md scale-100'
                            : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
                        }`}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function ProfileBorderEditor() {
  const [tab, setTab] = useState('custom');

  return (
    <article className="h-full flex flex-col w-full rounded-xl bg-gradient-to-br from-primary/5 to-primary/15 border border-primary/20 p-4 md:p-6 shadow-sm min-h-[500px] flex flex-col">
      <div className="w-full mb-6">
        <TabIndex setActiveTab={setTab} activeTab={tab} />
      </div>
      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
        {tab === 'custom' ? <CustomTab /> : <DesignTab />}
      </div>
    </article>
  );
}
