const {NotificationsAdapterMock}=require("../../adapters/notification.adapter.mock");

class NotificationsService{
  constructor({adapter=new NotificationsAdapterMock()}={}){this.adapter=adapter;}
  async notifyUser(uid,type,payload){return this.adapter.send(uid,type,payload);}
}

module.exports={NotificationsService};
    