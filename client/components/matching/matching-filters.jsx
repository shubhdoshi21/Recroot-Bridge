"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMatching } from "@/contexts/matching-context"
import { Info, Target, Settings, RotateCcw, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function MatchingFilters({ onFiltersChange }) {
  const { toast } = useToast()
  const { filters: contextFilters, setFilters: setContextFilters } = useMatching()
  const [localFilters, setLocalFilters] = useState(contextFilters)
  const [activeWeight, setActiveWeight] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Use refs to track if we're adjusting weights internally and to prevent update loops
  const isAdjustingWeights = useRef(false)
  const isInitialRender = useRef(true)
  const isUpdatingFromContext = useRef(false)
  const isUpdatingToContext = useRef(false)

  // Sync with context filters only when context changes and we're not
  // in the middle of updating the context ourselves
  useEffect(() => {
    if (isUpdatingToContext.current) return

    isUpdatingFromContext.current = true
    setLocalFilters(contextFilters)

    // Reset the flag after the state update is processed
    setTimeout(() => {
      isUpdatingFromContext.current = false
    }, 0)
  }, [contextFilters])

  // Validate weights add up to 100%
  useEffect(() => {
    if (isAdjustingWeights.current || isUpdatingFromContext.current) return

    const totalWeight = localFilters.skillsWeight + localFilters.experienceWeight + localFilters.educationWeight

    if (totalWeight !== 100) {
      isAdjustingWeights.current = true

      // Determine which weights to adjust based on the active weight
      if (activeWeight) {
        // Keep the active weight fixed and adjust the other two proportionally
        const activeWeightValue = localFilters[`${activeWeight}Weight`]
        const remainingWeight = 100 - activeWeightValue

        // Get the other two weights
        const otherWeights = ["skills", "experience", "education"].filter((w) => w !== activeWeight)

        // Calculate the current sum of the other two weights
        const otherWeightsSum = otherWeights.reduce((sum, w) => sum + localFilters[`${w}Weight`], 0)

        // If the sum is 0, distribute evenly
        if (otherWeightsSum === 0) {
          setLocalFilters((prev) => ({
            ...prev,
            [`${otherWeights[0]}Weight`]: remainingWeight / 2,
            [`${otherWeights[1]}Weight`]: remainingWeight / 2,
          }))
        } else {
          // Distribute proportionally
          const ratio0 = localFilters[`${otherWeights[0]}Weight`] / otherWeightsSum
          const ratio1 = localFilters[`${otherWeights[1]}Weight`] / otherWeightsSum

          setLocalFilters((prev) => ({
            ...prev,
            [`${otherWeights[0]}Weight`]: Math.round(remainingWeight * ratio0),
            [`${otherWeights[1]}Weight`]: Math.round(remainingWeight * ratio1),
          }))
        }
      } else {
        // No active weight, adjust all proportionally
        const adjustmentFactor = 100 / totalWeight

        setLocalFilters((prev) => ({
          ...prev,
          skillsWeight: Math.round(prev.skillsWeight * adjustmentFactor),
          experienceWeight: Math.round(prev.experienceWeight * adjustmentFactor),
          educationWeight: Math.round(prev.educationWeight * adjustmentFactor),
        }))
      }

      // Final check to ensure we have exactly 100%
      setTimeout(() => {
        setLocalFilters((prev) => {
          const newTotal = prev.skillsWeight + prev.experienceWeight + prev.educationWeight
          if (newTotal !== 100) {
            // Adjust the non-active weight with the highest value
            const weights = [
              { name: "skills", value: prev.skillsWeight },
              { name: "experience", value: prev.experienceWeight },
              { name: "education", value: prev.educationWeight },
            ]
              .filter((w) => w.name !== activeWeight)
              .sort((a, b) => b.value - a.value)

            const adjustmentNeeded = 100 - newTotal
            const weightToAdjust = weights[0].name

            return {
              ...prev,
              [`${weightToAdjust}Weight`]: prev[`${weightToAdjust}Weight`] + adjustmentNeeded,
            }
          }
          return prev
        })

        isAdjustingWeights.current = false
      }, 0)
    }
  }, [localFilters, activeWeight])

  // Apply filters whenever they change, but only if we're not adjusting weights
  // or updating from context
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    if (isAdjustingWeights.current || isUpdatingFromContext.current) return

    // Set flag to prevent context update from triggering another local update
    isUpdatingToContext.current = true

    // Update context
    setContextFilters(localFilters)

    // Notify parent
    if (onFiltersChange) {
      onFiltersChange(localFilters)
    }

    // Reset the flag after the context update is processed
    setTimeout(() => {
      isUpdatingToContext.current = false
    }, 0)
  }, [localFilters, onFiltersChange, setContextFilters])

  // Handlers for filter changes
  const handleWeightChange = useCallback((type, value) => {
    if (isUpdatingFromContext.current) return

    const clampedValue = Math.max(0, Math.min(100, value[0])) // Clamp between 0 and 100

    setActiveWeight(type)
    setLocalFilters((prev) => ({ ...prev, [`${type}Weight`]: clampedValue }))

    // Reset active weight after a delay
    setTimeout(() => setActiveWeight(null), 500)
  }, [])

  const handleMinMatchChange = useCallback(
    (value) => {
      if (isUpdatingFromContext.current) return

      setLocalFilters((prev) => ({ ...prev, minMatchPercentage: value[0] }))

      toast({
        title: "Minimum match updated",
        description: `Showing candidates with at least ${value[0]}% match`,
        duration: 2000,
      })
    },
    [toast],
  )

  const handleAutoMatchChange = useCallback(
    (checked) => {
      if (isUpdatingFromContext.current) return

      setLocalFilters((prev) => ({ ...prev, autoMatch: checked }))

      toast({
        title: checked ? "Auto-match enabled" : "Auto-match disabled",
        description: checked
          ? "New candidates will be automatically matched"
          : "New candidates will need manual matching",
        duration: 2000,
      })
    },
    [toast],
  )

  // Reset weights to default distribution
  const handleResetWeights = useCallback(() => {
    setLocalFilters((prev) => ({
      ...prev,
      skillsWeight: 40,
      experienceWeight: 35,
      educationWeight: 25,
    }))

    toast({
      title: "Weights reset",
      description: "Matching criteria weights have been reset to default values",
      duration: 2000,
    })
  }, [toast])

  // Calculate the importance level based on weight percentage
  const getImportanceLevel = (weight) => {
    if (weight >= 50) return "High"
    if (weight >= 30) return "Medium"
    return "Low"
  }

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[56px] min-w-0' : 'w-[340px] min-w-[340px]'}
      `}
    >
      <CardHeader className="bg-gradient-to-r from-transparent to-blue-50/50 pb-4">
        <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-0 px-1' : ''}`}>
          <CardTitle className={`flex items-center gap-2 text-lg ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && 'Matching Criteria'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-blue-50 transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Only show filter content when expanded */}
      {!isCollapsed && (
        <CardContent className="space-y-6 p-6">
          <div className="pt-2 pb-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Criteria Weights
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="sr-only">Weight information</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Adjust the importance of each criterion. When you change one weight, the others will automatically
                      adjust to maintain a total of 100%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetWeights}
              className="mb-4 text-xs h-8 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset to Default
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="skills-weight" className="text-sm font-medium text-gray-700">Skills Weight</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Importance: <span className="font-medium">{getImportanceLevel(localFilters.skillsWeight)}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">{localFilters.skillsWeight}%</span>
              </div>
              <Slider
                id="skills-weight"
                value={[localFilters.skillsWeight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleWeightChange("skills", value)}
                className={activeWeight === "skills" ? "ring-2 ring-blue-300 rounded-lg" : ""}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="experience-weight" className="text-sm font-medium text-gray-700">Experience Weight</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Importance: <span className="font-medium">{getImportanceLevel(localFilters.experienceWeight)}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">{localFilters.experienceWeight}%</span>
              </div>
              <Slider
                id="experience-weight"
                value={[localFilters.experienceWeight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleWeightChange("experience", value)}
                className={activeWeight === "experience" ? "ring-2 ring-blue-300 rounded-lg" : ""}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="education-weight" className="text-sm font-medium text-gray-700">Education Weight</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Importance: <span className="font-medium">{getImportanceLevel(localFilters.educationWeight)}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">{localFilters.educationWeight}%</span>
              </div>
              <Slider
                id="education-weight"
                value={[localFilters.educationWeight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleWeightChange("education", value)}
                className={activeWeight === "education" ? "ring-2 ring-blue-300 rounded-lg" : ""}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Label htmlFor="min-match" className="text-sm font-medium text-gray-700">Minimum Match Percentage</Label>
                <span className="text-sm font-bold text-blue-600">{localFilters.minMatchPercentage}%</span>
              </div>
              <Slider
                id="min-match"
                value={[localFilters.minMatchPercentage]}
                min={0}
                max={100}
                step={5}
                onValueChange={handleMinMatchChange}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <Label htmlFor="auto-match" className="mb-1 block text-sm font-medium text-gray-700">
                  Auto-match new candidates
                </Label>
                <p className="text-xs text-gray-500">Automatically match new candidates when added</p>
              </div>
              <Switch
                id="auto-match"
                checked={localFilters.autoMatch}
                onCheckedChange={handleAutoMatchChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}