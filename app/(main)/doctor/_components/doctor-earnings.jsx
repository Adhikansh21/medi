"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  CreditCard,
  Loader2,
  AlertCircle,
  Coins,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { requestPayout } from "@/actions/payout";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

/**
 * DoctorEarnings component for displaying a doctor's earnings and managing payouts.
 * @param {object} props
 * @param {object} props.earnings - The main earnings data for the doctor.
 * @param {number} props.earnings.thisMonthEarnings - Earnings for the current month.
 * @param {number} props.earnings.completedAppointments - Total completed appointments.
 * @param {number} props.earnings.averageEarningsPerMonth - Average monthly earnings.
 * @param {number} props.earnings.availableCredits - The number of credits available for payout.
 * @param {number} props.earnings.availablePayout - The net amount available for payout.
 * @param {Array} props.payouts - A list of past and pending payout requests.
 */
export function DoctorEarnings({ earnings, payouts = [] }) {
  // State to manage the payout request dialog visibility
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  // State to store the PayPal email entered by the user
  const [paypalEmail, setPaypalEmail] = useState("");

  // Destructure earnings data for easier access
  const {
    thisMonthEarnings = 0,
    completedAppointments = 0,
    averageEarningsPerMonth = 0,
    availableCredits = 0,
    availablePayout = 0,
  } = earnings;

  // Use a custom hook to manage the async server action for payout requests
  const { loading, data, fn: submitPayoutRequest } = useFetch(requestPayout);

  // Check if there is an ongoing payout request with a "PROCESSING" status
  const pendingPayout = payouts.find(
    (payout) => payout.status === "PROCESSING"
  );

  // Calculate the platform fee based on available credits ($2 per credit)
  const platformFee = availableCredits * 2;

  /**
   * Handles the payout request form submission.
   * @param {Event} e - The form submission event.
   */
  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    if (!paypalEmail) {
      toast.error("PayPal email is required");
      return;
    }

    const formData = new FormData();
    formData.append("paypalEmail", paypalEmail);

    // Call the server action via the useFetch hook
    await submitPayoutRequest(formData);
  };

  // Effect to handle success state after a payout request is submitted
  useEffect(() => {
    if (data?.success) {
      // Close the dialog and clear the email input on success
      setShowPayoutDialog(false);
      setPaypalEmail("");
      // Show a success toast notification
      toast.success("Payout request submitted successfully!");
    }
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Earnings Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Credits Card */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-3xl font-bold text-white">{availableCredits}</p>
                <p className="text-xs text-muted-foreground">${availablePayout.toFixed(2)} available for payout</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Coins className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month's Earnings Card */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-white">${thisMonthEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Appointments Card */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold text-white">{completedAppointments}</p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Monthly Earnings Card */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg/Month</p>
                <p className="text-3xl font-bold text-white">${averageEarningsPerMonth.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Management Section */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
            Payout Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">
                Available for Payout
              </h3>
              {/* Show different badge based on pending payout status */}
              {pendingPayout ? (
                <Badge
                  variant="outline"
                  className="bg-amber-900/20 border-amber-900/30 text-amber-400"
                >
                  PROCESSING
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                >
                  Available
                </Badge>
              )}
            </div>

            {/* Render different content based on pending payout status */}
            {pendingPayout ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pending Credits</p>
                    <p className="text-white font-medium">{pendingPayout.credits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending Amount</p>
                    <p className="text-white font-medium">${pendingPayout.netAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PayPal Email</p>
                    <p className="text-white font-medium text-xs">
                      {pendingPayout.paypalEmail}
                    </p>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your payout request is being processed. You'll receive the
                    payment once an admin approves it. Your credits will be
                    deducted after processing.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Available Credits</p>
                  <p className="text-white font-medium">{availableCredits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payout Amount</p>
                  <p className="text-white font-medium">
                    ${availablePayout.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Platform Fee</p>
                  <p className="text-white font-medium">
                    ${platformFee.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Show request payout button if no pending payout and credits are available */}
            {!pendingPayout && availableCredits > 0 && (
              <Button
                onClick={() => setShowPayoutDialog(true)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                Request Payout for All Credits
              </Button>
            )}

            {/* Show a message if no credits are available for payout */}
            {availableCredits === 0 && !pendingPayout && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  No credits available for payout. Complete more appointments to
                  earn credits.
                </p>
              </div>
            )}
          </div>

          {/* Payout structure information alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Payout Structure:</strong> You earn $8 per credit.
              Platform fee is $2 per credit. Payouts include all your available
              credits and are processed via PayPal.
            </AlertDescription>
          </Alert>

          {/* Payout History Section */}
          {payouts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Payout History</h3>
              <div className="space-y-2">
                {payouts.slice(0, 5).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/10 border border-emerald-900/10"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {format(new Date(payout.createdAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payout.credits} credits • ${payout.netAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payout.paypalEmail}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        payout.status === "PROCESSED"
                          ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                          : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Request Payout
            </DialogTitle>
            <DialogDescription>
              Request payout for all your available credits
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available credits:</span>
                <span className="text-white">{availableCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross amount:</span>
                <span className="text-white">
                  {/* Assuming $10 per credit, total earnings before fee */}
                  ${(availableCredits * 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee (20%):</span>
                <span className="text-white">-${platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-emerald-900/20 pt-2 flex justify-between font-medium">
                <span className="text-white">Net payout:</span>
                <span className="text-emerald-400">
                  ${availablePayout.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="your-email@paypal.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="bg-background border-emerald-900/20"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the PayPal email where you want to receive the payout.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Once processed by admin, {availableCredits} credits will be
                deducted from your account and ${availablePayout.toFixed(2)}{" "}
                will be sent to your PayPal.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPayoutDialog(false)}
                disabled={loading}
                className="border-emerald-900/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Request Payout"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
