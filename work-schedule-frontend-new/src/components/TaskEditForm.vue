<template>
  <div class="task-edit-container">
    <h2>Edit Task</h2>
    
    <div v-if="loading" class="loading">
      Loading task data...
    </div>
    
    <div v-else class="task-form">
      <div class="schedule-info">
        <h3>{{ scheduleTitle }}</h3>
      </div>
      
      <form @submit.prevent="saveTask">
        <div class="form-group">
          <label for="taskName">Task Name:</label>
          <input type="text" id="taskName" v-model="task.Task_Name" disabled />
        </div>
        
        <div class="form-group">
          <label for="description">Custom Description:</label>
          <textarea 
            id="description" 
            v-model="task.Task_Description"
            placeholder="Add your specific description for this task"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="completion">Completion Percentage:</label>
          <div class="completion-input">
            <input 
              type="range" 
              id="completion" 
              v-model.number="task.Completion_Percentage"
              min="0"
              max="100"
              step="5"
            />
            <span class="completion-value">{{ task.Completion_Percentage }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${task.Completion_Percentage}%` }"
              :class="getProgressClass(task.Completion_Percentage)"
            ></div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="notes">Notes:</label>
          <textarea 
            id="notes" 
            v-model="task.Notes"
            placeholder="Add notes about this task"
          ></textarea>
        </div>
        
        <div class="button-group">
          <button type="button" @click="$router.back()" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn-save">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const scheduleId = route.params.scheduleId;
    const taskId = route.params.taskId;
    
    const loading = ref(true);
    const schedule = ref(null);
    const task = ref({
      Task_Name: '',
      Task_Description: '',
      Completion_Percentage: 0,
      Notes: ''
    });
    
    const scheduleTitle = computed(() => {
      if (!schedule.value) return '';
      
      if (schedule.value.Schedule_Type === 'daily') {
        return `Daily Schedule: ${new Date(schedule.value.Date).toLocaleDateString()}`;
      } else {
        const [year, month] = schedule.value.Month.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1);
        return `Monthly Schedule: ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
      }
    });
    
    const fetchTaskData = async () => {
      try {
        // First get the schedule
        const scheduleResponse = await api.getScheduleById(scheduleId);
        schedule.value = scheduleResponse.data;
        
        // Find the specific task
        const taskData = schedule.value.tasks.find(t => t.WSTID == taskId);
        
        if (!taskData) {
          throw new Error('Task not found');
        }
        
        task.value = {
          Task_Name: taskData.Task_Name,
          Task_Description: taskData.Task_Description || '',
          Completion_Percentage: taskData.Completion_Percentage || 0,
          Notes: taskData.Notes || ''
        };
      } catch (error) {
        console.error('Error fetching task data:', error);
        alert('Failed to load task data');
        router.push('/schedules');
      } finally {
        loading.value = false;
      }
    };
    
    const getProgressClass = (percentage) => {
      if (percentage < 30) return 'progress-low';
      if (percentage < 70) return 'progress-medium';
      return 'progress-high';
    };
    
    const saveTask = async () => {
      try {
        const payload = {
          description: task.value.Task_Description,
          completionPercentage: task.value.Completion_Percentage,
          notes: task.value.Notes
        };
        
        await api.updateScheduleTask(scheduleId, taskId, payload);
        
        // Navigate back to the schedule page
        router.push(`/schedules/${scheduleId}`);
      } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task');
      }
    };
    
    onMounted(() => {
      fetchTaskData();
    });
    
    return {
      loading,
      schedule,
      task,
      scheduleTitle,
      getProgressClass,
      saveTask
    };
  }
};
</script>

<style scoped>
.task-edit-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
}

.schedule-info {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input[type="text"], textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  min-height: 80px;
}

.completion-input {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

input[type="range"] {
  flex: 1;
}

.completion-value {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-low {
  background-color: #f44336;
}

.progress-medium {
  background-color: #ff9800;
}

.progress-high {
  background-color: #4caf50;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}
</style>