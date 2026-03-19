/**
 * Reusable SaaS-style Card component.
 * Props:
 *  - title (string): Card header title
 *  - subtitle (string): Optional subtitle below title
 *  - icon: Optional React node for an icon next to the title
 *  - actions: Optional React node (e.g. buttons) placed top-right
 *  - noPadding (bool): Skip default padding, for custom content
 *  - hover (bool): Enable hover lift effect
 *  - className: Extra tailwind classes
 *  - children: Content body
 */
const Card = ({
  title,
  subtitle,
  icon,
  actions,
  noPadding = false,
  hover = false,
  className = '',
  children
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-xl shadow-sm 
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
      ${className}
    `}>
      {(title || actions) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
