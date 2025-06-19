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
import { Bell, Settings, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['alertPreferences'],
    queryFn: () => apiService.getAlertPreferences(),
    enabled: isOpen,
    retry: false,
  });

  // Create preferences mutation
  const createMutation = useMutation({
    mutationFn: (data: AlertPreferenceCreate) => apiService.createAlertPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences'] });
      toast({
        title: "Alert Settings Created",
        description: "Your alert preferences have been saved successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Settings",
        description: error.message || "Could not save alert preferences.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (data: AlertPreferenceUpdate) => apiService.updateAlertPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences'] });
      toast({
        title: "Alert Settings Updated",
        description: "Your alert preferences have been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Settings",
        description: error.message || "Could not update alert preferences.",
        variant: "destructive",
      });
    },
  });

  // Delete preferences mutation
  const deleteMutation = useMutation({
    mutationFn: () => apiService.deleteAlertPreferences(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertPreferences'] });
      toast({
        title: "Alert Settings Deleted",
        description: "Your alert preferences have been deleted.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Settings",
        description: error.message || "Could not delete alert preferences.",
        variant: "destructive",
      });
    },
  });

  // Check if this is a new preference (404 error means no preferences exist)
  useEffect(() => {
    if (error && error.message.includes('404')) {
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
  }, [preferences, error, form]);

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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your alert settings? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Alert Settings</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-orange"></div>
            <span className="ml-2 text-white/80">Loading settings...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Alert Active Toggle */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-white">Enable Alerts</FormLabel>
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
                    <FormLabel className="text-white">Minimum Profit Margin (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="bg-glass-purple/20 border-neon-orange/30 text-white"
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
                    <FormLabel className="text-white">Minimum Stock Required</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="bg-glass-purple/20 border-neon-orange/30 text-white"
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
                    <FormLabel className="text-white">Alert Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-glass-purple/20 border-neon-orange/30 text-white">
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
                    <FormLabel className="text-white">Include Retailers</FormLabel>
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
                          <label htmlFor={retailer} className="text-sm font-medium text-white">
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
              <div className="flex justify-between pt-4">
                <div>
                  {!isNewPreference && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete Settings'}
                    </Button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-neon-orange hover:bg-neon-orange/80"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : isNewPreference 
                        ? 'Create Settings' 
                        : 'Update Settings'
                    }
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AlertSettingsModal;