"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  User, 
  Users,
  MapPin,
  GraduationCap, 
  FileCheck,
  Briefcase,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft
} from "lucide-react"

// Import step components
import { PersonalInfoStep } from "@/components/steps/personal-info-step"
import { ContactParentInfoStep } from "@/components/steps/contact-parent-info-step"
import { AddressStep } from "@/components/steps/address-step"
import { TenthStandardStep } from "@/components/steps/tenth-standard-step"
import { TwelfthStandardStep } from "@/components/steps/twelfth-standard-step"
import { EngineeringDetailsStep } from "@/components/steps/engineering-details-step"
import { FinalKYCStep } from "@/components/steps/final-kyc-step"

// Import types
import { 
  PersonalInfo, 
  ContactAndParentDetails, 
  AddressDetails, 
  TenthStandardDetails,
  TwelfthStandardDetails,
  EngineeringDetails,
  FinalKYCDetails
} from "@/types/profile"

interface ProfileStep {
  id: number
  title: string
  description: string
  isComplete: boolean
}

const PROFILE_STEPS: ProfileStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself - basic personal details and identity",
    isComplete: false
  },
  {
    id: 2,
    title: "Contact & Family Details", 
    description: "Your contact information and parent/guardian details",
    isComplete: false
  },
  {
    id: 3,
    title: "Address Information",
    description: "Where do you live? Current and permanent address details",
    isComplete: false
  },
  {
    id: 4,
    title: "10th Standard Details",
    description: "Your SSC/10th standard academic performance and documents",
    isComplete: false
  },
  {
    id: 5,
    title: "12th/Diploma Details",
    description: "Your HSC/12th standard or diploma academic performance",
    isComplete: false
  },
  {
    id: 6,
    title: "Engineering Details",
    description: "Your current engineering college and semester performance",
    isComplete: false
  },
  {
    id: 7,
    title: "Final Verification",
    description: "Document verification and complete your placement profile",
    isComplete: false
  }
]

type ProfileData = {
  personalInfo?: Partial<PersonalInfo>
  contactDetails?: Partial<ContactAndParentDetails>
  addressDetails?: Partial<AddressDetails>
  tenthDetails?: Partial<TenthStandardDetails>
  twelfthDetails?: Partial<TwelfthStandardDetails>
  engineeringDetails?: Partial<EngineeringDetails>
  kycDetails?: Partial<FinalKYCDetails>
  completionStep?: number
  isComplete?: boolean
}

export default function ProfileTestPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState<ProfileStep[]>(PROFILE_STEPS)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({})

  const saveProfileStep = async (stepData: Partial<ProfileData>) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log("Saving step data:", stepData)
      setProfile(prev => ({ ...prev, ...stepData }))
      
      // Mark current step as complete
      setSteps(prev => prev.map(step => ({
        ...step,
        isComplete: step.id <= currentStep
      })))
      
      toast.success("Profile updated successfully! (Test Mode)")
      return true
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error("Error saving profile:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async (stepData: any) => {
    // Structure the data correctly based on current step
    let structuredData: Partial<ProfileData> = {}
    
    switch (currentStep) {
      case 1:
        structuredData = { personalInfo: stepData }
        break
      case 2:
        structuredData = { contactDetails: stepData }
        break
      case 3:
        structuredData = { addressDetails: stepData }
        break
      case 4:
        structuredData = { tenthDetails: stepData }
        break
      case 5:
        structuredData = { twelfthDetails: stepData }
        break
      case 6:
        structuredData = { engineeringDetails: stepData }
        break
      case 7:
        structuredData = { kycDetails: stepData }
        break
    }

    const success = await saveProfileStep(structuredData)
    if (success) {
      if (currentStep < 7) {
        setCurrentStep(prev => prev + 1)
      } else {
        // Profile completion
        const completeProfile = { ...structuredData, isComplete: true }
        await saveProfileStep(completeProfile)
        toast.success("Profile completed successfully! (Test Mode - Check console for data)")
        console.log("Final Profile Data:", { ...profile, ...completeProfile })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getStepIcon = (step: ProfileStep) => {
    const iconProps = { size: 20 }
    
    switch (step.id) {
      case 1:
        return <User {...iconProps} />
      case 2:
        return <Users {...iconProps} />
      case 3:
        return <MapPin {...iconProps} />
      case 4:
        return <GraduationCap {...iconProps} />
      case 5:
        return <GraduationCap {...iconProps} />
      case 6:
        return <Briefcase {...iconProps} />
      case 7:
        return <FileCheck {...iconProps} />
      default:
        return <Circle {...iconProps} />
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={profile.personalInfo || {}}
            onNext={handleNext}
            isLoading={isLoading}
          />
        )
      case 2:
        return (
          <ContactParentInfoStep
            data={profile.contactDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      case 3:
        return (
          <AddressStep
            data={profile.addressDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      case 4:
        return (
          <TenthStandardStep
            data={profile.tenthDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      case 5:
        return (
          <TwelfthStandardStep
            data={profile.twelfthDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      case 6:
        return (
          <EngineeringDetailsStep
            data={profile.engineeringDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      case 7:
        return (
          <FinalKYCStep
            data={profile.kycDetails || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  const progress = (currentStep / 7) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Complete Your Profile</h1>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  TEST MODE
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">
                Welcome to SDMCET Placement Portal! Complete these 7 steps to get ready for placements.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2 sm:h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} of 7</span>
              <span>{steps[currentStep - 1]?.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 lg:py-8">
        {/* Mobile Step Indicator */}
        <div className="block lg:hidden mb-6">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  currentStep === step.id 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                    : step.isComplete
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.isComplete ? (
                  <CheckCircle2 size={16} />
                ) : (
                  step.id
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Step Navigation */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-3 mb-8">
          {steps.map((step) => (
            <Card 
              key={step.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                currentStep === step.id && "ring-2 ring-primary border-primary shadow-lg",
                step.isComplete && "bg-green-50 dark:bg-green-950/20"
              )}
              onClick={() => setCurrentStep(step.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    step.isComplete 
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                      : currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step.isComplete ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  {step.isComplete && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-2 leading-tight">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStepIcon(steps[currentStep - 1])}
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    {steps[currentStep - 1]?.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {steps[currentStep - 1]?.description}
                  </CardDescription>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-700 flex items-center space-x-2">
              <span>Debug Information</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Test Mode Only
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <p><strong>Current Step:</strong> {currentStep} - {steps[currentStep - 1]?.title}</p>
              <p><strong>Completed Steps:</strong> {steps.filter(s => s.isComplete).map(s => s.id).join(", ") || "None"}</p>
              <p><strong>Progress:</strong> {Math.round(progress)}%</p>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">View Profile Data</summary>
                <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
