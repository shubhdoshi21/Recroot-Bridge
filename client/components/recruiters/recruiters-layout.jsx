"use client"
import React from "react"
import { useRecruiters } from "@/contexts/recruiters-context"

export function RecruitersLayout({ children }) {
  const { isFilterCollapsed } = useRecruiters()

  // Get the children array
  const childrenArray = React.Children.toArray(children)

  // First child is the filter component, second is the list component
  const filterComponent = childrenArray[0]
  const listComponent = childrenArray[1]

  return (
    <div className="flex gap-4 transition-all duration-300 ease-in-out">
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isFilterCollapsed ? "w-[120px]" : "w-[300px]"
        }`}
      >
        {filterComponent}
      </div>
      <div className="flex-grow min-w-0">{listComponent}</div>
    </div>
  )
}
