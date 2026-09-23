sed -i 's/const liveMsgs = snap.docs.map(d=>d.data()).filter(m => m && m.id);/const liveMsgs = snap.docs.map(d=>Object.assign(d.data(), { pending: d.metadata.hasPendingWrites, st: d.metadata.hasPendingWrites ? 1 : 2 })).filter(m => m \&\& m.id);/' index.html
sed -i 's/(c.messages || \[\]).forEach(m => { if(m && m.id) msgMap\[m.id\] = m; });//' index.html
