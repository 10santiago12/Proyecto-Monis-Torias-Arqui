const {SessionsRepo}=require("../repos/sessions.repo");
const {TutorsRepo}=require("../repos/tutors.repo");
const {NotificationsService}=require("./support/notifications.service");

class SessionsService{
  constructor({sessionsRepo=new SessionsRepo(),tutorsRepo=new TutorsRepo(),
    notifications=new NotificationsService()}={}){
    this.sessions=sessionsRepo;
    this.tutors=tutorsRepo;
    this.notifications=notifications;
  }

  async requestSession(user,dto){
    // dto:{tutorCode,topic,description,durationMin,preferredAt,currency,price,hourlyRate}
    const tutor=await this.tutors.getByCode(dto.tutorCode);
    if(!tutor){throw new Error("Tutor code not found");}
    const data={
      status:"requested",
      studentId:user.uid,
      tutorId:tutor.uid||null,
      tutorCode:dto.tutorCode,
      topic:dto.topic,
      description:dto.description||"",
      durationMin:dto.durationMin,
      preferredAt:dto.preferredAt||null,
      scheduledAt:null,
      currency:dto.currency||"COP",
      price:dto.price||null,
      hourlyRate:dto.hourlyRate||null,
      createdAt:new Date().toISOString(),
    };
    const s=await this.sessions.create(data);
    // Notificar al tutor
    await this.notifications.notifyUser(tutor.uid,"SESSION_REQUEST",{
      sessionId:s.id,topic:data.topic,
    });
    return s;
  }

  async confirmByTutor(user,sessionId,{scheduledAt}){
    const s=await this.sessions.getById(sessionId);
    if(!s)throw new Error("Session not found");
    // tutor puede confirmar si es dueño del código/uid
    if(s.tutorId&&s.tutorId!==user.uid){
      throw new Error("Not your session");
    }
    if(s.status!=="requested"){
      throw new Error("Session not in requested state");
    }
    const upd={status:"confirmed",scheduledAt:scheduledAt,
      confirmedAt:new Date().toISOString()};
    await this.sessions.update(sessionId,upd);
    return {...s,...upd,id:sessionId};
  }

  async markDoneByStudent(user,sessionId){
    const s=await this.sessions.getById(sessionId);
    if(!s)throw new Error("Session not found");
    if(s.studentId!==user.uid){throw new Error("Not your session");}
    if(s.status!=="confirmed"){throw new Error("Session not confirmed");}
    const upd={status:"done",doneAt:new Date().toISOString()};
    await this.sessions.update(sessionId,upd);
    return {...s,...upd,id:sessionId};
  }

  async getById(id){return this.sessions.getById(id);}
}

module.exports={SessionsService};
