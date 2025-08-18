const admin=require("firebase-admin");

class NotificationsAdapterMock {
  async send(uid,type,payload) {
    // Demo: guarda en colección 'notifications'
    const data={uid,type,payload,createdAt:new Date().toISOString()};
    const ref=await admin.firestore().collection("notifications").add(data);
    return {id:ref.id,...data};
  }
}

module.exports={NotificationsAdapterMock};
