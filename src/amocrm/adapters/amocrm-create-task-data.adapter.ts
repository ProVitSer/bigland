import { DEFAULT_TASKS_TEXT } from '../amocrm.constants';
import { ResponsibleUserId, TaskTypeId } from '../interfaces/amocrm.enum';
import { AmocrmAddTasks } from '../interfaces/amocrm.interfaces';
import * as moment from 'moment';

export class AmocrmCreateTaskDataAdapter {
    public amocrmRequestData: AmocrmAddTasks;

    constructor(entityLeadId: number) {

        this.amocrmRequestData = {
            responsible_user_id: ResponsibleUserId.AdminCC,
            entity_id: entityLeadId,
            entity_type: 'leads',
            text: DEFAULT_TASKS_TEXT,
            task_type_id: TaskTypeId.NewLead,
            complete_till: moment().unix(),
        };
        
    }
}