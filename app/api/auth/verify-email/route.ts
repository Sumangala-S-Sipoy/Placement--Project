import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=missing-token", request.url)
      )
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || 'verification-failed')}`, request.url)
      )
    }

    return NextResponse.redirect(
      new URL("/login?success=email-verified", request.url)
    )

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/login?error=internal-error", request.url)
    )
  }
}
