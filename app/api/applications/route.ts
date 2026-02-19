import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Helper to check tier eligibility (same logic as jobs API)
function canApplyToTier(studentTier: string | null, jobTier: string, isDreamOffer: boolean): { eligible: boolean; reason?: string } {

    if (isDreamOffer) return { eligible: true }
    if (!studentTier) return { eligible: true }

    if (studentTier === "TIER_1") {
        return { eligible: false, reason: "You are already placed in Tier 1 and blocked from further placements" }
    }
    if (studentTier === "TIER_2") {
        if (jobTier === "TIER_1") return { eligible: true }
        return { eligible: false, reason: "You are placed in Tier 2. You can only apply for Tier 1 jobs" }
    }
    if (studentTier === "TIER_3") {
        if (jobTier === "TIER_1" || jobTier === "TIER_2") return { eligible: true }
        return { eligible: false, reason: "You are placed in Tier 3. You can only apply for Tier 1 or Tier 2 jobs" }
    }
    return { eligible: true }
}

// POST - Apply to a job (one-click)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        console.log("Application POST body:", JSON.stringify(body, null, 2))

        const { jobId, responses, resumeUrl } = body   // ✅ added resumeUrl

        if (!jobId) {
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
        }

        // Get job details
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: {
                id: true,
                title: true,
                companyName: true,
                status: true,
                deadline: true,
                tier: true,
                isDreamOffer: true,
                minCGPA: true,
                maxBacklogs: true,
                allowedBranches: true,
                eligibleBatch: true,
                customFields: true
            }
        })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        // ✅ Fetch profile correctly
        const userProfile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            select: {
                branch: true,
                batch: true,
                finalCgpa: true,
                cgpa: true,
                activeBacklogs: true,
                hasBacklogs: true,
            }
        })

        if (!userProfile) {
            return NextResponse.json(
                { error: "Please complete your profile before applying" },
                { status: 400 }
            )
        }

        const cgpa = userProfile.finalCgpa || userProfile.cgpa || 0

        // Check CGPA
        if (job.minCGPA && cgpa < job.minCGPA) {
            return NextResponse.json(
                { error: `Minimum CGPA required: ${job.minCGPA}` },
                { status: 400 }
            )
        }

        // Check branch
        if (job.allowedBranches?.length > 0 && userProfile.branch) {
            if (!job.allowedBranches.includes(userProfile.branch)) {
                return NextResponse.json({
                    error: `Your branch (${userProfile.branch}) is not eligible`
                }, { status: 400 })
            }
        }

        // Check batch
        if (job.eligibleBatch && userProfile.batch) {
            const studentBatchYear = userProfile.batch.split('-').pop()?.trim()
            const jobBatchYear = job.eligibleBatch.split('-').pop()?.trim()

            if (studentBatchYear !== jobBatchYear) {
                return NextResponse.json({
                    error: `Only ${job.eligibleBatch} batch is eligible`
                }, { status: 400 })
            }
        }

        // Check backlogs
        const hasActiveBacklogs =
            userProfile.activeBacklogs || userProfile.hasBacklogs === "yes"

        if (job.maxBacklogs !== null && job.maxBacklogs === 0 && hasActiveBacklogs) {
            return NextResponse.json(
                { error: "No active backlogs allowed" },
                { status: 400 }
            )
        }

        // Validate custom fields
        if (job.customFields?.length > 0) {
            for (const field of job.customFields) {
                const response = responses?.find((r: any) => r.fieldId === field.id)
                if (field.required && (!response || !response.value)) {
                    return NextResponse.json({
                        error: `Custom field "${field.label}" is required`
                    }, { status: 400 })
                }
            }
        }

        // ✅ Create application (use resumeUrl from frontend)
        const application = await prisma.application.create({
            data: {
                jobId,
                userId: session.user.id,
                resumeUsed: resumeUrl,   // ✅ fixed
                responses: responses && Array.isArray(responses)
                    ? {
                        create: responses.map((r: any) => ({
                            fieldId: r.fieldId,
                            value: r.value
                        }))
                    }
                    : undefined
            }
        })

        return NextResponse.json({
            success: true,
            application,
            message: `Successfully applied to ${job.title} at ${job.companyName}`
        }, { status: 201 })

    } catch (error) {
        console.error("Error applying to job:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
