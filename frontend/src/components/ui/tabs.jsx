// frontend/src/components/ui/tabs.jsx

import * as React from "react"
import { cn } from "../../utils/cn"

// Context to share state between Tabs components
const TabsContext = React.createContext({
  value: '',
  onValueChange: () => {}
})

const Tabs = React.forwardRef(({ 
  className, 
  defaultValue, 
  value: controlledValue, 
  onValueChange, 
  children, 
  ...props 
}, ref) => {
  // Use controlled value if provided, otherwise use internal state
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = React.useCallback((newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [controlledValue, onValueChange])

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

// TabsList - container for tab triggers
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-start w-full rounded-md bg-gray-100 p-1 text-gray-500",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

// TabsTrigger - individual tab button
const TabsTrigger = React.forwardRef(({ 
  className, 
  value, 
  disabled,
  ...props 
}, ref) => {
  const context = React.useContext(TabsContext)
  const isSelected = context.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => !disabled && context.onValueChange(value)}
      className={cn(
        "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected 
          ? "bg-white text-gray-900 shadow-sm" 
          : "text-gray-600 hover:text-gray-900",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

// TabsContent - content panel for each tab
const TabsContent = React.forwardRef(({ 
  className, 
  value,
  forceMount,
  ...props 
}, ref) => {
  const context = React.useContext(TabsContext)
  const isSelected = context.value === value

  // Only render if selected (unless forceMount is true)
  if (!isSelected && !forceMount) {
    return null
  }

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      hidden={!isSelected}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
        !isSelected && "hidden",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }