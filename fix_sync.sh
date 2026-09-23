sed -i 's/const livePosts = snap.docs.map(d => d.data()).filter(p => p && p.id);/const livePosts = snap.docs.map(d => Object.assign(d.data(), { pending: d.metadata.hasPendingWrites })).filter(p => p \&\& p.id);/' index.html

sed -i 's/(S.posts || \[\]).forEach(p => { if (p && p.id) postMap\[p.id\] = p; });//g' index.html
