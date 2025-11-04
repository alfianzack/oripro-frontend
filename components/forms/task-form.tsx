'use client'

import React, { useState, useEffect } from 'react'
import { Task, CreateTaskData, UpdateTaskData, assetsApi, rolesApi, taskGroupsApi, tasksApi, Asset, Role, TaskGroup } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const taskSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  is_main_task: z.boolean().optional(),
  is_need_validation: z.boolean().optional(),
  is_scan: z.boolean().optional(),
  scan_code: z.string().optional().nullable(),
  duration: z.number().int().min(1, 'Duration must be at least 1'),
  asset_id: z.string().min(1, 'Asset is required').uuid('Asset ID must be a valid UUID'),
  role_id: z.number().int().min(1, 'Role is required'),
  is_all_times: z.boolean().optional(),
  parent_task_ids: z.array(z.number().int()).optional(),
  task_group_id: z.number().int().optional().nullable(),
  days: z.array(z.number().int()).optional(),
  times: z.array(z.string()).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task | null
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function TaskForm({ task, onSubmit, onCancel, loading = false }: TaskFormProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [parentTasks, setParentTasks] = useState<Task[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [taskGroupsLoading, setTaskGroupsLoading] = useState(true)
  const [parentTasksLoading, setParentTasksLoading] = useState(true)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      is_main_task: false,
      is_need_validation: false,
      is_scan: false,
      scan_code: null,
      duration: 1,
      asset_id: '',
      role_id: 0,
      is_all_times: false,
      parent_task_ids: [],
      task_group_id: null,
      days: [],
      times: [],
    },
  })

  const isAllTimes = form.watch('is_all_times')

  // Load assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await assetsApi.getAssets()
        if (response.success && response.data) {
          const responseData = response.data as any
          const assetsData = Array.isArray(responseData.data) ? responseData.data : []
          setAssets(assetsData)
        }
      } catch (error) {
        console.error('Load assets error:', error)
      } finally {
        setAssetsLoading(false)
      }
    }
    loadAssets()
  }, [])

  // Load roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await rolesApi.getRoles()
        if (response.success && response.data) {
          setRoles(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        console.error('Load roles error:', error)
      } finally {
        setRolesLoading(false)
      }
    }
    loadRoles()
  }, [])

  // Load task groups
  useEffect(() => {
    const loadTaskGroups = async () => {
      try {
        const response = await taskGroupsApi.getTaskGroups()
        if (response.success && response.data) {
          const responseData = response.data as any
          const taskGroupsData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
          setTaskGroups(taskGroupsData)
        }
      } catch (error) {
        console.error('Load task groups error:', error)
      } finally {
        setTaskGroupsLoading(false)
      }
    }
    loadTaskGroups()
  }, [])

  // Load parent tasks
  useEffect(() => {
    const loadParentTasks = async () => {
      try {
        const response = await tasksApi.getTasks()
        if (response.success && response.data) {
          const responseData = response.data as any
          const tasksData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])
          // Filter out current task if editing
          const filtered = task ? tasksData.filter((t: Task) => t.id !== task.id) : tasksData
          setParentTasks(filtered)
        }
      } catch (error) {
        console.error('Load parent tasks error:', error)
      } finally {
        setParentTasksLoading(false)
      }
    }
    loadParentTasks()
  }, [task])

  // Update form values when task changes (for edit mode)
  useEffect(() => {
    if (task) {
      // Normalize IDs to numbers
      const normalizeId = (id: number | string | undefined): number | undefined => {
        if (id === undefined || id === null) return undefined
        return typeof id === 'string' ? parseInt(id) : id
      }
      
      const normalizeIds = (ids: (number | string)[] | undefined): number[] => {
        if (!ids || ids.length === 0) return []
        return ids.map(id => typeof id === 'string' ? parseInt(id) : id)
      }
      
      form.reset({
        name: task.name || '',
        is_main_task: task.is_main_task || false,
        is_need_validation: task.is_need_validation || false,
        is_scan: task.is_scan || false,
        scan_code: task.scan_code || null,
        duration: task.duration || 0,
        asset_id: task.asset_id || '',
        role_id: task.role_id || 0,
        is_all_times: task.is_all_times || false,
        parent_task_ids: task.parent_task_ids 
          ? normalizeIds(task.parent_task_ids)
          : (task.parent_task_id ? [normalizeId(task.parent_task_id)!].filter(Boolean) as number[] : []),
        task_group_id: task.task_group_id ? normalizeId(task.task_group_id) : null,
        days: task.days || [],
        times: task.times || [],
      })
    }
  }, [task, form])

  const handleSubmit = async (data: TaskFormData) => {
    console.log('TaskForm handleSubmit called with data:', data)
    console.log('Form errors:', form.formState.errors)
    
    try {
      const submitData: CreateTaskData | UpdateTaskData = {
        name: data.name.trim(),
        is_main_task: data.is_main_task,
        is_need_validation: data.is_need_validation,
        is_scan: data.is_scan,
        scan_code: data.scan_code?.trim() || undefined,
        duration: data.duration,
        asset_id: data.asset_id,
        role_id: data.role_id,
        is_all_times: data.is_all_times,
        // Only include parent_task_ids if it has items
        ...(data.parent_task_ids && data.parent_task_ids.length > 0 ? { parent_task_ids: data.parent_task_ids } : {}),
        // Only include task_group_id if it has a value
        ...(data.task_group_id ? { task_group_id: data.task_group_id } : {}),
        // Only include days if it has items
        ...(data.days && data.days.length > 0 ? { days: data.days } : {}),
        // Only include times if it has items
        ...(data.times && data.times.length > 0 ? { times: data.times } : {}),
      }
      console.log('Submitting data:', submitData)
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error // Re-throw to let form handle it
    }
  }

  const handleDayToggle = (day: number, checked: boolean) => {
    const currentDays = form.getValues('days') || []
    if (checked) {
      form.setValue('days', [...currentDays, day])
    } else {
      form.setValue('days', currentDays.filter(d => d !== day))
    }
  }

  const handleTimeAdd = () => {
    const currentTimes = form.getValues('times') || []
    form.setValue('times', [...currentTimes, '00:00'])
  }

  const handleTimeRemove = (index: number) => {
    const currentTimes = form.getValues('times') || []
    form.setValue('times', currentTimes.filter((_, i) => i !== index))
  }

  const handleTimeChange = (index: number, value: string) => {
    const currentTimes = form.getValues('times') || []
    const updated = [...currentTimes]
    updated[index] = value
    form.setValue('times', updated)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.error('Form validation errors:', errors)
        console.error('Form values:', form.getValues())
      })} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter task name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asset and Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="asset_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={assetsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                  disabled={rolesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter duration in minutes"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task Group */}
        <FormField
          control={form.control}
          name="task_group_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Group</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === 'none' ? undefined : parseInt(value))} 
                value={field.value?.toString() || 'none'}
                disabled={taskGroupsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task group (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {taskGroups.map((tg) => (
                    <SelectItem key={tg.id} value={tg.id.toString()}>
                      {tg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boolean Switches */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_main_task"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Main Task</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Mark this task as a main task
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_need_validation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Requires Validation</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    This task requires validation
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_scan"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Requires Scan</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    This task requires scanning
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_all_times"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">All Times</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Task is available at all times
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Scan Code */}
        {form.watch('is_scan') && (
          <FormField
            control={form.control}
            name="scan_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scan Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter scan code" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Parent Tasks */}
        <FormField
          control={form.control}
          name="parent_task_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Tasks</FormLabel>
              <div className="space-y-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
                {parentTasksLoading ? (
                  <div className="text-sm text-muted-foreground">Loading tasks...</div>
                ) : parentTasks.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No parent tasks available</div>
                ) : (
                  parentTasks.map((parentTask) => {
                    const taskId = typeof parentTask.id === 'string' ? parseInt(parentTask.id) : parentTask.id
                    return (
                    <div key={parentTask.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`parent-${parentTask.id}`}
                        checked={field.value?.includes(taskId) || false}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, taskId])
                          } else {
                            field.onChange(current.filter(id => id !== taskId))
                          }
                        }}
                      />
                      <label
                        htmlFor={`parent-${parentTask.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {parentTask.name}
                      </label>
                    </div>
                    )
                  })
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Days - Only show if not all times */}
        {!isAllTimes && (
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days of Week</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border rounded-lg p-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={field.value?.includes(day.value) || false}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Times - Only show if not all times */}
        {!isAllTimes && (
          <FormField
            control={form.control}
            name="times"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Times</FormLabel>
                <div className="space-y-2">
                  {(field.value || []).map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTimeRemove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTimeAdd}
                  >
                    Add Time
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

