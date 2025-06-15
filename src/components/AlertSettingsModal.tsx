
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertPreference, AlertPreferenceCreate, AlertPreferenceUpdate } from '@/types/alerts';
import { apiService } from '@/services/api';
import { Bell, Settings } from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface FormData {
  profit_margin_threshold: number;
  min_stock: number;
  include_retailers: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  is_active: boolean;
}

const AVAILABLE_RETAILERS = [
  'Amazon',
  'Barnes & Noble',
  'ThriftBooks',
  'BookOutlet',
  'AbeBooks',
];

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
] as const;

const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const queryClient = useQueryClient();
  const [isNewPreference, setIsNewPreference] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      profit_margin_threshold: 20,
      min_stock: 1,
      include_retailers: ['Amazon'],
      alert_frequency: 'daily',
      is_active: true,
    },
  });

  // Fetch existing preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['alertPreferences', userId],
    queryFn: () => apiService.getAlertPreferences(userId),
    enabled: isOpen && !!userId,
    retry: false,
  });

  // Create preferences mutation
  const createMutation = useMutation({
    mutationFn: (data: AlertPreferenceCreate) => apiService.createAlertPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences', userId] });
      onClose();
    },
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (data: AlertPreferenceUpdate) => apiService.updateAlertPreferences(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences', userId] });
      onClose();
    },
  });

  // Check if this is a new preference (404 error means no preferences exist)
  useEffect(() => {
    if (!isLoading && !preferences) {
      setIsNewPreference(true);
    } else if (preferences) {
      setIsNewPreference(false);
      // Reset form with existing data
      form.reset({
        profit_margin_threshold: preferences.profit_margin_threshold,
        min_stock: preferences.min_stock,
        include_retailers: preferences.include_retailers,
        alert_frequency: preferences.alert_frequency,
        is_active: preferences.is_active,
      });
    }
  }, [preferences, isLoading, form]);

  const onSubmit = (data: FormData) => {
    if (isNewPreference) {
      createMutation.mutate({
        user_id: userId,
        ...data,
      });
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleRetailerChange = (retailer: string, checked: boolean) => {
    const currentRetailers = form.getValues('include_retailers');
    if (checked) {
      form.setValue('include_retailers', [...currentRetailers, retailer]);
    } else {
      form.setValue('include_retailers', currentRetailers.filter(r => r !== retailer));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Alert Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Alert Active Toggle */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Enable Alerts</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Profit Margin Threshold */}
            <FormField
              control={form.control}
              name="profit_margin_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Profit Margin (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum Stock */}
            <FormField
              control={form.control}
              name="min_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Required</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alert Frequency */}
            <FormField
              control={form.control}
              name="alert_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Include Retailers */}
            <FormField
              control={form.control}
              name="include_retailers"
              render={() => (
                <FormItem>
                  <FormLabel>Include Retailers</FormLabel>
                  <div className="space-y-3">
                    {AVAILABLE_RETAILERS.map((retailer) => (
                      <div key={retailer} className="flex items-center space-x-2">
                        <Checkbox
                          id={retailer}
                          checked={form.watch('include_retailers').includes(retailer)}
                          onCheckedChange={(checked) => 
                            handleRetailerChange(retailer, checked as boolean)
                          }
                        />
                        <label htmlFor={retailer} className="text-sm font-medium">
                          {retailer}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isNewPreference ? 'Create' : 'Update'} Settings
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertSettingsModal;
