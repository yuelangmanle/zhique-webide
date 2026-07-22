interface BottomNavProps {
  activeView: 'editor' | 'ai' | 'builder';
  onViewChange: (view: 'editor' | 'ai' | 'builder') => void;
}

export const BottomNav = ({ activeView, onViewChange }: BottomNavProps) => {
  const navItems = [
    { id: 'editor' as const, label: 'Editor', icon: '📝' },
    { id: 'ai' as const, label: 'AI', icon: '🤖' },
    { id: 'builder' as const, label: 'Build', icon: '📦' },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-600 flex items-center justify-around py-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all duration-200 ${
            activeView === item.id
              ? 'text-primary-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
