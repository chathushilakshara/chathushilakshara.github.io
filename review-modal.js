/* ── REVIEW MODAL ── */
(function(){
    var REVIEW_PIN = '1111';
    var overlay   = document.getElementById('reviewModalOverlay');
    var openBtn   = document.getElementById('leaveReviewBtn');
    var closeBtn  = document.getElementById('reviewModalClose');
    var step1     = document.getElementById('reviewStep1');
    var step2     = document.getElementById('reviewStep2');
    var step3     = document.getElementById('reviewStep3');
    var pinError  = document.getElementById('pinError');
    var pinInputs = document.querySelectorAll('.pin-input');

    function openModal(){
        if(overlay) overlay.classList.add('active');
        document.body.style.overflow='hidden';
        if(step1) step1.style.display = 'block';
        if(step2) step2.style.display = 'none';
        if(step3) step3.style.display = 'none';
        pinInputs.forEach(function(i){i.value='';});
        if(pinError) pinError.textContent='';
        setTimeout(function(){if(pinInputs[0])pinInputs[0].focus();},200);
    }
    function closeModal(){
        if(overlay) overlay.classList.remove('active');
        document.body.style.overflow='';
    }
    function showStep(n){
        if(step1) step1.style.display = n===1?'block':'none';
        if(step2) step2.style.display = n===2?'block':'none';
        if(step3) step3.style.display = n===3?'block':'none';
    }

    if(openBtn) openBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(overlay) overlay.addEventListener('click', function(e){if(e.target===overlay)closeModal();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay&&overlay.classList.contains('active'))closeModal();});

    pinInputs.forEach(function(inp, idx){
        inp.addEventListener('input', function(){
            inp.value = inp.value.replace(/[^0-9]/g,'').slice(-1);
            if(inp.value && idx < pinInputs.length-1) pinInputs[idx+1].focus();
        });
        inp.addEventListener('keydown', function(e){
            if(e.key==='Backspace' && !inp.value && idx > 0) pinInputs[idx-1].focus();
        });
        inp.addEventListener('paste', function(e){
            e.preventDefault();
            var pasted = (e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'');
            pinInputs.forEach(function(pi,i){ pi.value = pasted[i]||''; });
            var last = Math.min(pasted.length, pinInputs.length) - 1;
            if(last>=0) pinInputs[last].focus();
        });
    });

    var pinBtn = document.getElementById('pinSubmitBtn');
    if(pinBtn) pinBtn.addEventListener('click', function(){
        var entered = Array.from(pinInputs).map(function(i){return i.value;}).join('');
        if(entered.length < 4){ 
            if(pinError) pinError.textContent='Enter all 4 digits.'; 
            return; 
        }
        if(entered === REVIEW_PIN) {
            if(pinError) pinError.textContent = '';
            showStep(2);
            if(document.getElementById('rv_name')) document.getElementById('rv_name').value='';
            if(document.getElementById('rv_text')) document.getElementById('rv_text').value='';
        } else {
            if(pinError) pinError.textContent = 'Incorrect password. Try again. ❌';
            pinInputs.forEach(function(i) { i.value = ''; });
            pinInputs[0].focus();
        }
    });

    var reviewSubmitBtn = document.getElementById('reviewSubmitBtn');
    if(reviewSubmitBtn) reviewSubmitBtn.addEventListener('click', async function(){
        var name = document.getElementById('rv_name') ? document.getElementById('rv_name').value.trim() : '';
        var text = document.getElementById('rv_text') ? document.getElementById('rv_text').value.trim() : '';
        
        if(!name){ alert('Please enter your name'); return; }
        if(!text){ alert('Please enter your review'); return; }
        
        try {
            // Get Firebase utilities
            const utils = window.firebaseUtils;
            
            if(!utils || !utils.db) {
                alert('Database connection not ready. Please refresh and try again.');
                return;
            }
            
            // Add review to Firebase
            await utils.addDoc(utils.collection(utils.db, 'reviews'), {
                name: name,
                text: text,
                role: document.getElementById('rv_role') ? document.getElementById('rv_role').value : 'Client',
                rating: 5,
                createdAt: utils.serverTimestamp()
            });
            
            showStep(3);
            
            // Reset form
            setTimeout(function() {
                if(document.getElementById('rv_name')) document.getElementById('rv_name').value = '';
                if(document.getElementById('rv_text')) document.getElementById('rv_text').value = '';
                if(document.getElementById('rv_role')) document.getElementById('rv_role').value = '';
            }, 500);
        } catch(error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review: ' + error.message);
        }
    });

    var doneBtn = document.getElementById('reviewDoneBtn');
    if(doneBtn) doneBtn.addEventListener('click', closeModal);
})();