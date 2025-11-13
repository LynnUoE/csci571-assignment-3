import * as React from "react"
import { cn } from "../../utils/cn"

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value)

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            value: value || selectedValue, 
            onValueChange: handleValueChange 
          })
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

// TabsList - full width with light gray background
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center bg-gray-100",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

// TabsTrigger - equal width tabs, active tab has white background
const TabsTrigger = React.forwardRef(({ className, value, onValueChange, ...props }, ref) => {
  const parentValue = props['data-value']
  const isSelected = parentValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        "flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
        isSelected 
          ? "bg-white text-gray-900" 
          : "bg-gray-100 text-gray-600 hover:text-gray-900",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const parentValue = props['data-value']
  const isSelected = parentValue === value

  if (!isSelected) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

// Wrapper components to handle value propagation
const TabsListWrapper = ({ value, onValueChange, children }) => (
  <TabsList>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 'data-value': value, onValueChange })
      }
      return child
    })}
  </TabsList>
)

const TabsContentWrapper = ({ value, children }) => (
  <>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 'data-value': value })
      }
      return child
    })}
  </>
)

export { Tabs, TabsListWrapper as TabsList, TabsTrigger, TabsContentWrapper as TabsContent }