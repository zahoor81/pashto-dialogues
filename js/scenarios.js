/* Pashto Pair Dialogues — scenario bank.
 *
 * Two people record together. In every dialogue one is the USER, the other plays the PHONE (assistant);
 * roles swap every dialogue. Cards are written in ROMAN URDU (ru) so everyone can read them, but speakers
 * always SPEAK PASHTO. English (en) is kept for the researcher and the dataset.
 *
 * Task dialogues: a fixed list of turns (steps), ending after the last one.
 * Conversations: open-ended. The phone asks the topic's questions (and its own follow-ups) for as long as the
 * pair wants; they end it with "Guftagu khatam".
 *
 * Placeholders: {slot} -> Roman Urdu value, {slot.en} -> English value, {slot.field} -> any field.
 * Chips: 'slot' shows the value; 'slot:wrong' shows the deliberately wrong value (phone cards).
 * Editing is safe: change the words, keep the IDs (T01, C05) and the order of steps.
 */
(function () {
  'use strict';

  const POOLS = {
    times: [
      { en: '5:00 AM', ru: 'subah 5 baje', wrong_en: '6:00 AM', wrong_ru: 'subah 6 baje' },
      { en: '6:30 AM', ru: 'subah saadhe 6 baje', wrong_en: '7:30 AM', wrong_ru: 'subah saadhe 7 baje' },
      { en: '7:00 AM', ru: 'subah 7 baje', wrong_en: '7:00 PM', wrong_ru: 'shaam 7 baje' },
      { en: '8:15 AM', ru: 'subah sawa 8 baje', wrong_en: '8:50 AM', wrong_ru: 'subah 8:50' },
      { en: '11:00 AM', ru: 'subah 11 baje', wrong_en: '11:00 PM', wrong_ru: 'raat 11 baje' },
      { en: '1:30 PM', ru: 'dopahar dedh baje', wrong_en: '1:00 PM', wrong_ru: 'dopahar 1 baje' },
      { en: '4:00 PM', ru: 'sehpahar 4 baje', wrong_en: '4:00 AM', wrong_ru: 'subah 4 baje' },
      { en: '5:00 PM', ru: 'shaam 5 baje', wrong_en: '5:00 AM', wrong_ru: 'subah 5 baje' },
      { en: '7:45 PM', ru: 'shaam paune 8 baje', wrong_en: '7:15 PM', wrong_ru: 'shaam sawa 7 baje' },
      { en: '9:00 PM', ru: 'raat 9 baje', wrong_en: '9:00 AM', wrong_ru: 'subah 9 baje' },
      { en: '10:30 PM', ru: 'raat saadhe 10 baje', wrong_en: '11:30 PM', wrong_ru: 'raat saadhe 11 baje' }
    ],
    days: [
      { en: 'Today', ru: 'aaj', wrong_en: 'Tomorrow', wrong_ru: 'kal' },
      { en: 'Tomorrow', ru: 'kal', wrong_en: 'Today', wrong_ru: 'aaj' },
      { en: 'Day after tomorrow', ru: 'parson', wrong_en: 'Tomorrow', wrong_ru: 'kal' },
      { en: 'Friday', ru: 'jumma', wrong_en: 'Thursday', wrong_ru: 'jumeraat' },
      { en: 'Monday', ru: 'peer', wrong_en: 'Sunday', wrong_ru: 'itwaar' },
      { en: 'Thursday', ru: 'jumeraat', wrong_en: 'Tuesday', wrong_ru: 'mangal' },
      { en: 'Saturday', ru: 'hafta', wrong_en: 'Friday', wrong_ru: 'jumma' }
    ],
    durs: [
      { en: '2 minutes', ru: '2 minute', wrong_en: '12 minutes', wrong_ru: '12 minute' },
      { en: '5 minutes', ru: '5 minute', wrong_en: '15 minutes', wrong_ru: '15 minute' },
      { en: '10 minutes', ru: '10 minute', wrong_en: '20 minutes', wrong_ru: '20 minute' },
      { en: '15 minutes', ru: '15 minute', wrong_en: '50 minutes', wrong_ru: '50 minute' },
      { en: '20 minutes', ru: '20 minute', wrong_en: '2 minutes', wrong_ru: '2 minute' },
      { en: '30 minutes', ru: 'aadha ghanta', wrong_en: '30 seconds', wrong_ru: '30 second' },
      { en: '1 hour', ru: 'ek ghanta', wrong_en: '1 minute', wrong_ru: 'ek minute' }
    ],
    contacts: [
      { en: 'Ahmad', ru: 'Ahmad', rel_en: 'brother', rel_ru: 'bhai' },
      { en: 'Zarmina', ru: 'Zarmina', rel_en: 'sister', rel_ru: 'behen' },
      { en: 'Bilal', ru: 'Bilal', rel_en: 'friend', rel_ru: 'dost' },
      { en: 'Palwasha', ru: 'Palwasha', rel_en: 'colleague', rel_ru: 'sathi' },
      { en: 'Shah Mahmood', ru: 'Shah Mahmood', rel_en: 'uncle', rel_ru: 'chacha' },
      { en: 'Nazia', ru: 'Nazia', rel_en: 'aunt', rel_ru: 'khala' },
      { en: 'Waheed', ru: 'Waheed', rel_en: 'colleague', rel_ru: 'sathi' },
      { en: 'Dr Rahman', ru: 'Doctor Rahman', rel_en: 'doctor', rel_ru: 'doctor' },
      { en: 'Gul Bibi', ru: 'Gul Bibi', rel_en: 'neighbour', rel_ru: 'padosan' },
      { en: 'Yousaf', ru: 'Yousaf', rel_en: 'cousin', rel_ru: 'cousin' }
    ],
    items: [
      { en: 'take medicine', ru: 'dawai khana', icon: '💊' },
      { en: 'pay the electricity bill', ru: 'bijli ka bill dena', icon: '💡' },
      { en: 'pick the children up from school', ru: 'bachon ko school se lana', icon: '🏫' },
      { en: 'recharge mobile balance', ru: 'mobile balance dalwana', icon: '📱' },
      { en: 'buy vegetables', ru: 'sabzi khareedna', icon: '🥕' },
      { en: 'change the gas cylinder', ru: 'gas cylinder badalna', icon: '🔥' },
      { en: 'water the plants', ru: 'paudon ko pani dena', icon: '🌱' },
      { en: 'go to the bank', ru: 'bank jana', icon: '🏦' }
    ],
    events: [
      { en: 'meeting', ru: 'meeting', icon: '👥' },
      { en: 'doctor appointment', ru: 'doctor se appointment', icon: '🩺' },
      { en: 'wedding', ru: 'shaadi', icon: '💍' },
      { en: 'school parents meeting', ru: 'school ki meeting', icon: '🏫' },
      { en: 'job interview', ru: 'naukri ka interview', icon: '💼' },
      { en: 'family dinner', ru: 'ghar walon ke saath khana', icon: '🍲' }
    ],
    places: [
      { en: 'office', ru: 'daftar' }, { en: 'home', ru: 'ghar' }, { en: 'hospital', ru: 'hospital' },
      { en: 'school', ru: 'school' }, { en: 'market', ru: 'bazaar' }, { en: 'mosque', ru: 'masjid' }, { en: 'hotel', ru: 'hotel' }
    ],
    msgs: [
      { en: 'you’ll be 10 minutes late', ru: '10 minute late aaunga' },
      { en: 'bring bread on the way home', ru: 'ghar aate hue roti le aana' },
      { en: 'the meeting moved to Thursday', ru: 'meeting jumeraat par chali gayi' },
      { en: 'congratulations on the new job', ru: 'nayi naukri mubarak ho' },
      { en: 'ask if they reached home safely', ru: 'pooch lo ghar khairiyat se pohanch gaye' },
      { en: 'you’ll call them in the evening', ru: 'shaam ko call karunga' }
    ],
    msg_in: [
      { en: 'Are you coming home this evening?', ru: 'Aaj shaam ghar aa rahe ho?' },
      { en: 'My car broke down, can you help?', ru: 'Meri gaari kharab ho gayi, madad kar sakte ho?' },
      { en: 'Tomorrow’s meeting is at ten, don’t forget.', ru: 'Kal meeting 10 baje hai, bhoolna mat.' },
      { en: 'Happy Eid! How are you?', ru: 'Eid mubarak! Kaise ho?' },
      { en: 'Please send me that book.', ru: 'Woh kitaab bhej do please.' }
    ],
    pcts: [{ en: '15%', ru: '15 percent' }, { en: '42%', ru: '42 percent' }, { en: '68%', ru: '68 percent' }, { en: '87%', ru: '87 percent' }],
    dates: [
      { en: 'Friday, 7 November', ru: 'jumma, 7 November' },
      { en: 'Monday, 17 November', ru: 'peer, 17 November' },
      { en: 'Saturday, 29 November', ru: 'hafta, 29 November' }
    ]
  };
  const ICON = { times: '🕔', days: '📅', durs: '⏱️', contacts: '👤', items: '📝', events: '🗓️', places: '📍', msgs: '💬', msg_in: '📩', pcts: '🔋', dates: '📆' };

  function U(ru, en, o) { return Object.assign({ r: 'user', ru: ru, en: en }, o || {}); }
  function A(ru, en, o) { return Object.assign({ r: 'assistant', ru: ru, en: en }, o || {}); }
  const OK = A('Tasdeeq karein.', 'Confirm it.', { acts: ['confirmation'] });
  const OK_CLOSE = A('Tasdeeq karein aur baat khatam karein.', 'Confirm it and close the dialogue.', { acts: ['confirmation'] });

  // ------------------------------------------------------------------ task scenarios (fixed turns)
  const TASKS = [
    { id: 'T01', domain: 'alarm', title: { ru: 'Alarm', en: 'Alarm' }, slots: { day: 'days', time: 'times' }, steps: [
      U('Alarm lagwayein. Din batayein, lekin waqt abhi na batayein.', 'Ask for an alarm. Say the day, but not the time yet.', { show: ['day'], intent: 'set_alarm', acts: ['request'] }),
      A('Poochein: kitne baje?', 'Ask: at what time?', { acts: ['clarification'] }),
      U('Waqt batayein.', 'Say the time.', { show: ['time'], intent: 'set_alarm', acts: ['inform'] }),
      A('Tasdeeq karein, lekin jaan boojh kar ghalat waqt bolein.', 'Confirm it, but say the WRONG time on purpose.', { show: ['day', 'time:wrong'], acts: ['confirmation'] }),
      U('Waqt ghalat hai — theek karwayein.', 'The time is wrong — correct it.', { show: ['time'], intent: 'modify_alarm', acts: ['correction'] }),
      A('Maazrat karein, sahi waqt batayein, aur poochein: aur kuch?', 'Apologise, say the right time, and ask “anything else?”', { show: ['time'], acts: ['confirmation'] }),
      U('Iraada badal gaya: alarm ek ghanta baad kar dein.', 'You changed your mind: move the alarm one hour later.', { intent: 'modify_alarm', acts: ['follow_up'] }),
      OK_CLOSE
    ] },
    { id: 'T02', domain: 'alarm', title: { ru: 'Jagana', en: 'Wake-up call' }, slots: { time: 'times' }, steps: [
      U('Kahein ke is waqt aap ko jaga de — lafz “alarm” istemal na karein.', 'Ask it to wake you at this time — without saying “alarm”.', { show: ['time'], intent: 'set_alarm', acts: ['request'] }),
      A('Tasdeeq karein aur poochein: aur kuch?', 'Confirm and ask “anything else?”', { show: ['time'], acts: ['confirmation'] }),
      U('Poochein ke kaun kaun se alarm lage hue hain.', 'Ask which alarms you have set.', { intent: 'query_alarm', acts: ['question'] }),
      A('Batayein ke ek alarm laga hai, isi waqt ka.', 'Say there is one alarm, at this time.', { show: ['time'], acts: ['inform'] }),
      U('Usay hata dein — waqt dobara na batayein, sirf “woh wala” kahein.', 'Delete it — say “that one”, don’t repeat the time.', { intent: 'cancel_alarm', acts: ['contextual_reference'] }),
      A('Batayein ke alarm hata diya gaya.', 'Say the alarm is deleted.', { acts: ['confirmation'] })
    ] },
    { id: 'T03', domain: 'alarm', title: { ru: 'Alarm badalna', en: 'Change an alarm' }, slots: { time: 'times', time2: 'times', time3: 'times' }, steps: [
      U('Kahein ke ek alarm badalna hai, lekin yeh na batayein kaunsa.', 'Ask to change one of your alarms, but don’t say which.', { intent: 'modify_alarm', acts: ['request'] }),
      A('Batayein ke do alarm hain, aur poochein: kaunsa?', 'Say there are two alarms and ask: which one?', { show: ['time', 'time2'], acts: ['clarification'] }),
      U('Ek chunein — “pehla” ya “doosra” kahein, waqt na dohrayein.', 'Pick one by saying “the first” or “the second” — don’t repeat the time.', { intent: 'modify_alarm', acts: ['clarification', 'contextual_reference'] }),
      A('Poochein: naya waqt kya ho?', 'Ask: what is the new time?', { acts: ['clarification'] }),
      U('Naya waqt batayein.', 'Say the new time.', { show: ['time3'], intent: 'modify_alarm', acts: ['inform'] }),
      OK_CLOSE
    ] },
    { id: 'T04', domain: 'timer', title: { ru: 'Khane ka timer', en: 'Cooking timer' }, slots: { dur: 'durs' }, steps: [
      U('Khana pakane ke liye timer lagwayein, lekin muddat abhi na batayein.', 'Ask for a cooking timer, but don’t say how long yet.', { intent: 'set_timer', acts: ['request'] }),
      A('Poochein: kitni der ke liye?', 'Ask: for how long?', { acts: ['clarification'] }),
      U('Muddat batayein.', 'Say how long.', { show: ['dur'], intent: 'set_timer', acts: ['inform'] }),
      A('Batayein ke timer shuru ho gaya, lekin jaan boojh kar ghalat muddat bolein.', 'Say the timer started, but say the WRONG duration.', { show: ['dur:wrong'], acts: ['confirmation'] }),
      U('Muddat ghalat hai — theek karwayein.', 'Wrong duration — correct it.', { show: ['dur'], intent: 'modify_timer', acts: ['correction'] }),
      A('Maazrat karein aur sahi muddat batayein.', 'Apologise and say the right duration.', { show: ['dur'], acts: ['confirmation'] })
    ] },
    { id: 'T05', domain: 'timer', title: { ru: 'Timer', en: 'Timer' }, slots: { dur: 'durs' }, steps: [
      U('Timer lagwayein — muddat bhi batayein.', 'Ask for a timer, including how long.', { show: ['dur'], intent: 'set_timer', acts: ['request'] }),
      A('Tasdeeq karein ke timer shuru ho gaya.', 'Confirm the timer started.', { show: ['dur'], acts: ['confirmation'] }),
      U('Paanch minute aur barha dein.', 'Add five more minutes.', { intent: 'modify_timer', acts: ['follow_up'] }),
      OK,
      U('Ab timer band kar dein — zaroorat nahi rahi.', 'Now cancel the timer — you don’t need it.', { intent: 'cancel_timer', acts: ['request'] }),
      A('Batayein ke timer band ho gaya.', 'Say the timer is cancelled.', { acts: ['confirmation'] })
    ] },
    { id: 'T06', domain: 'reminder', title: { ru: 'Yaad-dihani (reminder)', en: 'Reminder' }, slots: { item: 'items', day: 'days', time: 'times' }, steps: [
      U('Is kaam ka reminder lagwayein, lekin waqt abhi na batayein.', 'Ask for a reminder about this task — no time yet.', { show: ['item'], intent: 'set_reminder', acts: ['request'] }),
      A('Poochein: kab?', 'Ask: when?', { acts: ['clarification'] }),
      U('Din aur waqt batayein.', 'Say the day and time.', { show: ['day', 'time'], intent: 'set_reminder', acts: ['inform'] }),
      A('Tasdeeq karein, lekin jaan boojh kar ghalat din bolein.', 'Confirm, but say the WRONG day on purpose.', { show: ['day:wrong', 'time'], acts: ['confirmation'] }),
      U('Din ghalat hai — theek karwayein.', 'The day is wrong — correct it.', { show: ['day'], intent: 'modify_reminder', acts: ['correction'] }),
      A('Theek karein aur tasdeeq karein.', 'Fix it and confirm.', { show: ['day', 'time'], acts: ['confirmation'] })
    ] },
    { id: 'T07', domain: 'reminder', title: { ru: 'Call ka reminder', en: 'Reminder to call' }, slots: { contact: 'contacts', day: 'days', time: 'times' }, steps: [
      U('Kahein ke is din yaad dilaye ke is shakhs ko call karni hai.', 'Ask to be reminded on this day to call this person.', { show: ['contact', 'day'], intent: 'set_reminder', acts: ['request'] }),
      A('Poochein: kitne baje?', 'Ask: at what time?', { acts: ['clarification'] }),
      U('Waqt batayein.', 'Say the time.', { show: ['time'], intent: 'set_reminder', acts: ['inform'] }),
      A('Tasdeeq karein, phir poochein: kya abhi call kar doon?', 'Confirm, then ask: shall I call them now?', { show: ['contact'], acts: ['confirmation', 'question'] }),
      U('Nahi — lekin unhein message bhej dein ke baad mein call karenge. Naam na lein.', 'No — but send them a message that you’ll call later. Don’t say the name.', { intent: 'send_message', acts: ['contextual_reference', 'follow_up'] }),
      A('Message parh kar sunayein aur poochein: bhej doon?', 'Read the message back and ask: shall I send it?', { acts: ['confirmation'] }),
      U('Haan kahein.', 'Confirm it.', { intent: 'send_message', acts: ['confirmation'] }),
      A('Batayein ke message bhej diya gaya.', 'Say the message was sent.', { acts: ['inform'] })
    ] },
    { id: 'T08', domain: 'reminder', title: { ru: 'Reminders dekhna', en: 'Check reminders' }, slots: { day: 'days', item: 'items', time: 'times', time2: 'times' }, steps: [
      U('Poochein ke is din aap ke kya reminders hain.', 'Ask what reminders you have on this day.', { show: ['day'], intent: 'query_reminder', acts: ['question'] }),
      A('Ek reminder batayein.', 'Tell them the one reminder.', { show: ['item', 'time'], acts: ['inform'] }),
      U('Usay is naye waqt par kar dein.', 'Move it to this new time.', { show: ['time2'], intent: 'modify_reminder', acts: ['follow_up', 'contextual_reference'] }),
      A('Tasdeeq karein aur poochein: aur kuch?', 'Confirm and ask “anything else?”', { show: ['time2'], acts: ['confirmation'] }),
      U('Kahein ke 10 minute pehle bhi yaad dilaye.', 'Ask for an extra reminder ten minutes before.', { intent: 'set_reminder', acts: ['follow_up'] }),
      OK_CLOSE
    ] },
    { id: 'T09', domain: 'calendar', title: { ru: 'Calendar mein event', en: 'Add to calendar' }, slots: { event: 'events', contact: 'contacts', day: 'days', day2: 'days', time: 'times', place: 'places' }, steps: [
      U('Calendar mein event dalwayein — is shakhs ke saath, is din.', 'Add an event to the calendar — with this person, on this day.', { show: ['event', 'contact', 'day'], intent: 'create_event', acts: ['request'] }),
      A('Poochein: kitne baje?', 'Ask: at what time?', { acts: ['clarification'] }),
      U('Waqt batayein.', 'Say the time.', { show: ['time'], intent: 'create_event', acts: ['inform'] }),
      A('Poochein: kahan?', 'Ask: where?', { acts: ['clarification'] }),
      U('Jagah batayein.', 'Say the place.', { show: ['place'], intent: 'create_event', acts: ['inform'] }),
      A('Saari tafseel dohra kar tasdeeq karein.', 'Repeat all the details back to confirm.', { acts: ['confirmation'] }),
      U('Plan badal gaya — isay doosre din par kar dein.', 'Plans changed — move it to this other day.', { show: ['day2'], intent: 'modify_event', acts: ['follow_up'] }),
      A('Naye din ki tasdeeq karein.', 'Confirm the new day.', { show: ['day2'], acts: ['confirmation'] })
    ] },
    { id: 'T10', domain: 'calendar', title: { ru: 'Program dekhna', en: 'Check calendar' }, slots: { day: 'days', event: 'events', time: 'times', contact: 'contacts' }, steps: [
      U('Poochein ke is din aap ka kya program hai.', 'Ask what is on your calendar on this day.', { show: ['day'], intent: 'query_calendar', acts: ['question'] }),
      A('Event aur waqt batayein.', 'Tell them the event and the time.', { show: ['event', 'time'], acts: ['inform'] }),
      U('Poochein ke kis ke saath hai.', 'Ask who it is with.', { intent: 'query_calendar', acts: ['follow_up', 'question'] }),
      A('Naam batayein.', 'Say the name.', { show: ['contact'], acts: ['inform'] }),
      U('Unhein call karein ta ke tasdeeq ho jaye — naam na lein.', 'Call them to confirm — don’t say the name.', { intent: 'make_call', acts: ['contextual_reference'] }),
      A('Batayein ke unhein call kar rahe hain.', 'Say you are calling them.', { show: ['contact'], acts: ['confirmation'] })
    ] },
    { id: 'T11', domain: 'calendar', title: { ru: 'Event cancel karna', en: 'Cancel an event' }, slots: { day: 'days', event: 'events', time: 'times', time2: 'times', contact: 'contacts' }, steps: [
      U('Yeh event cancel karwayein — din bhi batayein.', 'Cancel this event — mention the day.', { show: ['event', 'day'], intent: 'cancel_event', acts: ['request'] }),
      A('Batayein ke do events hain aur poochein: kaunsa?', 'Say there are two and ask: which one?', { show: ['time', 'time2'], acts: ['clarification'] }),
      U('Baad wala chunein — waqt na batayein.', 'Choose the later one — don’t say the time.', { intent: 'cancel_event', acts: ['clarification', 'contextual_reference'] }),
      A('Tasdeeq karein, phir poochein: kya is shakhs ko bata doon?', 'Confirm, then ask: shall I tell this person?', { show: ['contact'], acts: ['confirmation', 'question'] }),
      U('Haan — unhein batayein ke agle hafte tak multawi ho gaya.', 'Yes — tell them it’s postponed to next week.', { intent: 'send_message', acts: ['confirmation', 'inform'] }),
      A('Batayein ke message bhej diya gaya.', 'Say the message was sent.', { acts: ['inform'] })
    ] },
    { id: 'T12', domain: 'call', title: { ru: 'Call karna', en: 'Make a call' }, slots: { contact: 'contacts' }, steps: [
      U('Apne {contact.rel_ru} ko call karwayein — rishta batayein, naam na lein.', 'Ask to call your {contact.rel_en} — say the relation, not the name.', { show: ['contact'], intent: 'make_call', acts: ['request'] }),
      A('Naam ki tasdeeq karein aur poochein: mobile ya ghar ka number?', 'Confirm the name and ask: mobile or home number?', { show: ['contact'], acts: ['clarification'] }),
      U('Mobile chunein.', 'Choose mobile.', { intent: 'make_call', acts: ['clarification'] }),
      A('Batayein ke call ki lekin jawab nahi mila.', 'Say you called but there is no answer.', { acts: ['inform'] }),
      U('Kahein ke 10 minute baad dobara call kare.', 'Ask it to try again in ten minutes.', { intent: 'set_reminder', acts: ['follow_up'] }),
      OK_CLOSE
    ] },
    { id: 'T13', domain: 'call', title: { ru: 'Call, phir message', en: 'Call, then message' }, slots: { contact: 'contacts', contact2: 'contacts', msg: 'msgs' }, steps: [
      U('Is shakhs ko call karwayein.', 'Call this person.', { show: ['contact'], intent: 'make_call', acts: ['request'] }),
      A('Batayein ke woh jawab nahi de rahe; message bhejne ki pesh-kash karein.', 'Say they are not answering, and offer to send a message.', { acts: ['inform', 'question'] }),
      U('Haan — message apne alfaaz mein batayein.', 'Yes — say the message in your own words.', { show: ['msg'], intent: 'send_message', acts: ['confirmation', 'inform'] }),
      A('Tasdeeq karein, lekin jaan boojh kar ghalat shakhs ka naam lein.', 'Confirm, but name the WRONG person on purpose.', { show: ['contact2'], acts: ['confirmation'] }),
      U('Shakhs ghalat hai — theek karwayein.', 'Wrong person — correct it.', { show: ['contact'], intent: 'send_message', acts: ['correction'] }),
      A('Maazrat karein aur tasdeeq karein.', 'Apologise and confirm.', { show: ['contact'], acts: ['confirmation'] })
    ] },
    { id: 'T14', domain: 'call', title: { ru: 'Wapas call', en: 'Call back' }, slots: { contact: 'contacts', time: 'times' }, steps: [
      U('Poochein ke aakhri baar kis ne call ki thi.', 'Ask who called you last.', { intent: 'query_calls', acts: ['question'] }),
      A('Naam aur waqt batayein.', 'Say the name and the time.', { show: ['contact', 'time'], acts: ['inform'] }),
      U('Unhein wapas call karein — naam na lein.', 'Call them back — don’t say the name.', { intent: 'make_call', acts: ['contextual_reference'] }),
      A('Batayein ke woh jawab nahi de rahe.', 'Say they are not answering.', { acts: ['inform'] }),
      U('Kahein ke shaam ko yaad dilaye ke unhein dobara call karni hai.', 'Ask to be reminded this evening to call them again.', { intent: 'set_reminder', acts: ['follow_up', 'contextual_reference'] }),
      OK_CLOSE
    ] },
    { id: 'T15', domain: 'message', title: { ru: 'Message bhejna', en: 'Send a message' }, slots: { contact: 'contacts', contact2: 'contacts', msg: 'msgs' }, steps: [
      U('Is shakhs ko message bhejwayein — lekin abhi baat na batayein.', 'Ask to message this person — not the text yet.', { show: ['contact'], intent: 'send_message', acts: ['request'] }),
      A('Poochein: kya likhoon?', 'Ask: what should I write?', { acts: ['clarification'] }),
      U('Message apne alfaaz mein batayein.', 'Say the message in your own words.', { show: ['msg'], intent: 'send_message', acts: ['inform'] }),
      A('Parh kar sunayein, lekin jaan boojh kar ghalat shakhs ka naam lein.', 'Read it back, but name the WRONG person.', { show: ['contact2'], acts: ['confirmation'] }),
      U('Shakhs ghalat hai — theek karwayein.', 'Wrong person — correct it.', { show: ['contact'], intent: 'send_message', acts: ['correction'] }),
      A('Maazrat karein aur tasdeeq karein.', 'Apologise and confirm.', { show: ['contact'], acts: ['confirmation'] })
    ] },
    { id: 'T16', domain: 'message', title: { ru: 'Naye messages', en: 'New messages' }, slots: { contact: 'contacts', msg_in: 'msg_in' }, steps: [
      U('Poochein ke koi naye messages hain.', 'Ask if you have any new messages.', { intent: 'query_messages', acts: ['question'] }),
      A('Batayein kis ne likha aur kya likha.', 'Say who wrote and read out what they wrote.', { show: ['contact', 'msg_in'], acts: ['inform'] }),
      U('Unhein apne alfaaz mein jawab bhejein — naam na lein.', 'Reply to them in your own words — don’t say the name.', { intent: 'send_message', acts: ['contextual_reference', 'inform'] }),
      A('Tasdeeq karein aur poochein: aur kuch?', 'Confirm and ask “anything else?”', { acts: ['confirmation'] }),
      U('Poochein ke kisi aur ne bhi likha hai.', 'Ask if anyone else has written.', { intent: 'query_messages', acts: ['follow_up', 'question'] }),
      A('Batayein ke aur koi naya message nahi.', 'Say there are no other new messages.', { acts: ['inform'] })
    ] },
    { id: 'T17', domain: 'device', title: { ru: 'Battery aur torch', en: 'Battery and torch' }, slots: { pct: 'pcts' }, steps: [
      U('Poochein ke battery kitni bachi hai.', 'Ask how much battery is left.', { intent: 'query_battery', acts: ['question'] }),
      A('Battery batayein.', 'Say the battery level.', { show: ['pct'], acts: ['inform'] }),
      U('Torch jalwayein.', 'Turn on the torch.', { intent: 'torch_on', acts: ['request'] }),
      OK,
      U('Ab usay bujha dein — “usay” kahein, “torch” na kahein.', 'Now turn it off — say “it”, not “the torch”.', { intent: 'torch_off', acts: ['contextual_reference'] }),
      OK
    ] },
    { id: 'T18', domain: 'device', title: { ru: 'Waqt, taareekh, silent', en: 'Time, date, silent mode' }, slots: { time: 'times', date: 'dates' }, steps: [
      U('Poochein ke kitne baje hain.', 'Ask what time it is.', { intent: 'query_time', acts: ['question'] }),
      A('Waqt batayein.', 'Say the time.', { show: ['time'], acts: ['inform'] }),
      U('Taareekh bhi poochein — chhota sa, isi baat ke silsile mein.', 'Ask the date too, as a short follow-up.', { intent: 'query_date', acts: ['follow_up', 'question'] }),
      A('Taareekh batayein.', 'Say the date.', { show: ['date'], acts: ['inform'] }),
      U('Phone silent kar dein — aap meeting mein ja rahe hain.', 'Put the phone on silent — you’re going into a meeting.', { intent: 'silent_mode', acts: ['request'] }),
      OK,
      U('Kahein ke ek ghante baad wapas normal kar de.', 'Ask it to switch back to normal after one hour.', { intent: 'silent_mode', acts: ['follow_up'] }),
      OK_CLOSE
    ] }
  ];

  // ------------------------------------------------------------------ conversation topics (open-ended)
  function Q(en, ru) { return { en: en, ru: ru }; }
  function CMD(at, en, ru, intent, acts) { return { at: at, en: en, ru: ru, intent: intent, acts: acts || ['request'] }; }
  const CONVS = [
    { id: 'C01', title: { ru: 'Aap ke baare mein', en: 'About you' }, q: [
      Q('Who are you and where are you from?', 'Aap kaun hain aur kahan se hain?'),
      Q('Who is in your family?', 'Aap ke ghar mein kaun kaun hai?'),
      Q('What do you mostly do during the day?', 'Din bhar zyada tar kya karte hain?'),
      Q('What do you enjoy in your free time?', 'Fursat mein kya karna pasand hai?'),
      Q('If you could teach me one thing, what would it be?', 'Agar mujhe ek cheez sikhayein to woh kya hogi?')] },
    { id: 'C02', title: { ru: 'Aap ka shehar ya gaon', en: 'Your hometown' }, q: [
      Q('Tell me about your town or village.', 'Apne shehar ya gaon ke baare mein batayein.'),
      Q('Which place should I visit there?', 'Wahan jaoon to kaunsi jagah dekhoon?'),
      Q('What food do people eat there?', 'Wahan log kya khaate hain?'),
      Q('How has your town changed in ten years?', 'Das saal mein aap ka shehar kaise badla?')],
      cmd: [CMD(2, 'Ask to be reminded tomorrow evening to call a friend.', 'Kahein ke kal shaam yaad dilaye ke ek dost ko call karni hai.', 'set_reminder')] },
    { id: 'C03', title: { ru: 'Khana aur pakwan', en: 'Food and cooking' }, q: [
      Q('What is your favourite food?', 'Aap ka pasandeeda khana kaunsa hai?'),
      Q('How is it cooked, step by step?', 'Woh kaise banta hai? Qadam ba qadam batayein.'),
      Q('Who cooks at home?', 'Ghar mein zyada tar khana kaun pakata hai?'),
      Q('What special dishes do you make for Eid or guests?', 'Eid ya mehmanon ke liye kya khaas banate hain?')],
      cmd: [CMD(1, 'Ask for a timer for the tea — choose the duration yourself.', 'Chai ke liye timer lagwayein — muddat khud chunein.', 'set_timer')] },
    { id: 'C04', title: { ru: 'Rozmarra ki zindagi', en: 'Daily routine' }, q: [
      Q('How does your day start?', 'Aap ka din kaise shuru hota hai?'),
      Q('How do you spend the afternoon?', 'Dopahar kaise guzarti hai?'),
      Q('How do you spend your evenings?', 'Shaam kaise guzarti hai?'),
      Q('What one thing would you change about your day?', 'Apne din mein ek cheez badal sakein to kya badlenge?')],
      cmd: [CMD(1, 'Ask to be woken up tomorrow morning — choose the time.', 'Kahein ke kal subah jaga de — waqt khud chunein.', 'set_alarm')] },
    { id: 'C05', title: { ru: 'Mausam', en: 'Weather and seasons' }, q: [
      Q('How is the weather there today?', 'Aaj wahan mausam kaisa hai?'),
      Q('Which season do you like most, and why?', 'Kaunsa mausam pasand hai, aur kyun?'),
      Q('How do people keep warm in winter?', 'Sardiyon mein log khud ko garam kaise rakhte hain?'),
      Q('Has the weather ever ruined your plans?', 'Kabhi mausam ne aap ka plan kharab kiya?'),
      Q('What do you do against the summer heat?', 'Garmi se bachne ke liye kya karte hain?')] },
    { id: 'C06', title: { ru: 'Safar', en: 'Travel' }, q: [
      Q('Where was your last trip?', 'Aap ka aakhri safar kahan tha?'),
      Q('What happened on the trip?', 'Safar mein kya kya hua?'),
      Q('What was the best part?', 'Sab se achi baat kya thi?'),
      Q('If you could go anywhere, where would you go?', 'Kahin bhi ja sakein to kahan jayenge?')],
      cmd: [CMD(2, 'Ask to put your next trip in the calendar — say the day and place.', 'Agla safar calendar mein dalwayein — din aur jagah khud batayein.', 'create_event')] },
    { id: 'C07', title: { ru: 'Eid', en: 'Eid' }, q: [
      Q('How do you celebrate Eid?', 'Aap Eid kaise manate hain?'),
      Q('What do you do on Eid morning?', 'Eid ki subah kya karte hain?'),
      Q('What do children do? Do you give Eidi?', 'Bachay kya karte hain? Eidi dete hain?'),
      Q('Which Eid memory do you remember most?', 'Eid ki kaunsi yaad sab se zyada yaad hai?')],
      cmd: [CMD(2, 'Send an Eid greeting to a relative — say the name and message yourself.', 'Kisi rishtedar ko Eid mubarak ka message bhejwayein — naam aur baat khud batayein.', 'send_message')] },
    { id: 'C08', title: { ru: 'Shaadi aur riwaaj', en: 'Weddings and customs' }, q: [
      Q('How are weddings held in your area?', 'Aap ke ilaqe mein shaadi kaise hoti hai?'),
      Q('How many days, and what happens each day?', 'Kitne din chalti hai, aur har din kya hota hai?'),
      Q('What food is cooked at a wedding?', 'Shaadi mein kya khana banta hai?'),
      Q('How was the last wedding you went to?', 'Aakhri shaadi jis mein gaye, kaisi thi?'),
      Q('Which customs should change?', 'Kaunse riwaaj badalne chahiyein?')] },
    { id: 'C09', title: { ru: 'Kaam ya parhai', en: 'Work or studies' }, q: [
      Q('What work do you do, or what do you study?', 'Aap kya kaam karte hain ya kya parhte hain?'),
      Q('What is the hardest part?', 'Sab se mushkil hissa kya hai?'),
      Q('How do you get on with colleagues or classmates?', 'Sathiyon se taluqaat kaise hain?'),
      Q('Where do you see yourself in five years?', 'Paanch saal baad khud ko kahan dekhte hain?')],
      cmd: [CMD(1, 'Ask for a reminder about a meeting tomorrow — choose the time.', 'Kal ki meeting ka reminder lagwayein — waqt khud chunein.', 'set_reminder')] },
    { id: 'C10', title: { ru: 'Sehat aur gharelu ilaaj', en: 'Health and home remedies' }, q: [
      Q('What do you do at home when you catch a cold?', 'Nazla zukaam ho to ghar mein kya ilaaj karte hain?'),
      Q('Which home remedies are known in your family?', 'Aap ke ghar mein kaunse gharelu nuskhe mashhoor hain?'),
      Q('What do you do every day to stay healthy?', 'Sehatmand rehne ke liye roz kya karte hain?'),
      Q('Is it easy to reach a doctor where you live?', 'Aap ke ilaqe mein doctor tak pohanchna aasaan hai?')],
      cmd: [CMD(1, 'Ask for a daily evening reminder to take medicine — choose the time.', 'Roz shaam dawai ka reminder lagwayein — waqt khud chunein.', 'set_reminder')] },
    { id: 'C11', title: { ru: 'Bachpan', en: 'Childhood' }, q: [
      Q('What games did you play as a child?', 'Bachpan mein kaunse khel khelte the?'),
      Q('Which childhood friend do you still remember?', 'Bachpan ka kaunsa dost ab bhi yaad hai?'),
      Q('What was your school like?', 'Aap ka school kaisa tha?'),
      Q('Tell a memory that makes you laugh.', 'Koi aisi yaad sunayein jis par hansi aaye.'),
      Q('How is childhood today different from yours?', 'Aaj ke bachon aur aap ke bachpan mein kya farq hai?')] },
    { id: 'C12', title: { ru: 'Bazaar aur khareedari', en: 'Market and shopping' }, q: [
      Q('Which market do you usually buy from?', 'Zyada tar kis bazaar se khareedari karte hain?'),
      Q('What has become more expensive recently?', 'Aajkal kya cheezein mehngi hui hain?'),
      Q('Do you bargain? How do you get a good deal?', 'Bhaao taao karte hain? Achi deal kaise milti hai?'),
      Q('Have you ever shopped online?', 'Kabhi online khareedari ki hai?')],
      cmd: [CMD(1, 'Ask for a reminder to buy something on the way home — say what and when.', 'Ghar jaate hue kuch khareedne ka reminder lagwayein — cheez aur waqt khud batayein.', 'set_reminder')] },
    { id: 'C13', title: { ru: 'Khel aur cricket', en: 'Sports and cricket' }, q: [
      Q('Which sport do you like?', 'Kaunsa khel pasand hai?'),
      Q('Do you play it or just watch?', 'Khud khelte hain ya sirf dekhte hain?'),
      Q('Who is your favourite player, and why?', 'Pasandeeda khiladi kaun hai, aur kyun?'),
      Q('Which match do you remember as exciting?', 'Kaunsa match yaad hai jo bohat dilchasp tha?'),
      Q('Which sports do young people play in your area?', 'Aap ke ilaqe mein naujawan kaunse khel khelte hain?')] },
    { id: 'C14', title: { ru: 'Mobile aur technology', en: 'Phones and technology' }, q: [
      Q('What do you mostly use your phone for?', 'Mobile par zyada tar kya karte hain?'),
      Q('Have phones made life easier or harder?', 'Mobile ne zindagi aasaan ki ya mushkil?'),
      Q('How do the elders in your family use phones?', 'Ghar ke buzurg mobile kaise istemal karte hain?')],
      cmd: [CMD(0, 'Ask how much battery is left.', 'Poochein ke battery kitni bachi hai.', 'query_battery', ['question']),
            CMD(1, 'Ask it to turn on the torch — you dropped something.', 'Torch jalwayein — aap ki koi cheez gir gayi hai!', 'torch_on')] },
    { id: 'C15', title: { ru: 'Shayari aur mausiqi', en: 'Poetry and music' }, q: [
      Q('Do you like Pashto poetry or tappay?', 'Pashto shayari ya tappay pasand hain?'),
      Q('Who is your favourite poet or singer?', 'Pasandeeda shayar ya gulukar kaun hai?'),
      Q('Why do you like their work?', 'Un ka kaam kyun pasand hai?'),
      Q('Does anyone in your family write poetry or sing?', 'Ghar mein koi shayari karta ya gaata hai?'),
      Q('Does the young generation care about Pashto poetry?', 'Kya nayi nasal Pashto shayari mein dilchaspi leti hai?')] },
    { id: 'C16', title: { ru: 'Mashwara', en: 'Advice' }, q: [
      Q('What would you tell a young person first?', 'Kisi naujawan ko pehla mashwara kya denge?'),
      Q('Who gave you the best advice you got?', 'Aap ko sab se acha mashwara kis ne diya?'),
      Q('What mistake should others avoid?', 'Kaunsi ghalti doosron ko nahi karni chahiye?'),
      Q('What does success mean to you?', 'Aap ke liye kamyabi ka kya matlab hai?'),
      Q('Which values would you teach your children?', 'Apne bachon ko kaunsi qadrein sikhayenge?')] },
    { id: 'C17', title: { ru: 'Kheti, baagh aur janwar', en: 'Farming, gardens, animals' }, q: [
      Q('What do people grow in your area, or do you have a garden?', 'Aap ke ilaqe mein log kya ugaate hain, ya ghar mein baagh hai?'),
      Q('Do you keep animals or birds?', 'Ghar mein janwar ya parinday rakhte hain?'),
      Q('What is a day of farm or garden work like?', 'Kheti ya baagh ke kaam ka ek din kaisa hota hai?'),
      Q('How has a shortage of water or rain affected you?', 'Pani ya baarish ki kami ne aap ko kaise mutasir kiya?')],
      cmd: [CMD(2, 'Ask to be woken up early tomorrow — say the time.', 'Kahein ke kal subah sawere jaga de — waqt khud batayein.', 'set_alarm')] },
    { id: 'C18', title: { ru: 'Mehman nawazi', en: 'Hospitality' }, q: [
      Q('How do you welcome guests?', 'Mehmanon ka istaqbal kaise karte hain?'),
      Q('What food do you serve guests?', 'Mehmanon ko kya khilate hain?'),
      Q('Has a guest visited whom you never forgot?', 'Koi mehman jo kabhi nahi bhoole?'),
      Q('How is hospitality different in city and village?', 'Shehar aur gaon ki mehman nawazi mein kya farq hai?')],
      cmd: [CMD(1, 'Guests are coming tonight — send a message asking someone to bring something.', 'Aaj raat mehman aa rahe hain — kisi ko message bhejwayein ke kuch le aaye.', 'send_message')] },
    { id: 'C19', title: { ru: 'Ek mushkil jo hal ki', en: 'A problem you solved' }, q: [
      Q('Tell me about a problem you solved.', 'Koi mushkil batayein jo aap ne hal ki.'),
      Q('Who helped you?', 'Kis ne madad ki?'),
      Q('What did you learn from it?', 'Is se kya seekha?'),
      Q('What would you do differently next time?', 'Dobara aisa ho to kya mukhtalif karenge?')],
      cmd: [CMD(1, 'Ask to call that person now to thank them — say “them”, not the name.', 'Kahein ke abhi us shakhs ko call kare ta ke shukriya ada karein — naam na lein, “unhein” kahein.', 'make_call', ['request', 'contextual_reference'])] },
    { id: 'C20', title: { ru: 'Agle hafte ke plan', en: 'Plans for next week' }, q: [
      Q('What are your plans for next week?', 'Agle hafte kya plan hain?'),
      Q('Which plan matters most?', 'Kaunsa plan sab se zaroori hai?'),
      Q('What do you do to relax at the weekend?', 'Weekend par aaram ke liye kya karte hain?')],
      cmd: [CMD(0, 'Add one plan to the calendar — say the day and time.', 'Ek plan calendar mein dalwayein — din aur waqt khud batayein.', 'create_event'),
            CMD(1, 'Ask for an alarm on that same day — say “that day”.', 'Usi din ka alarm lagwayein — “usi din” kahein.', 'set_alarm', ['request', 'contextual_reference'])] }
  ];
  TASKS.forEach(function (t) { t.type = 'task'; });
  CONVS.forEach(function (c) { c.type = 'conv'; c.domain = 'chat'; c.cmd = c.cmd || []; });
  const BY_ID = {}; TASKS.concat(CONVS).forEach(function (s) { BY_ID[s.id] = s; });

  // ------------------------------------------------------------------ deterministic randomness
  function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function rngFor(s) { return mulberry32(xmur3(s)()); }
  function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fill(str, slots) { return (str || '').replace(/\{(\w+)(?:\.(\w+))?\}/g, function (m, k, f) { const v = slots[k]; if (!v) return m; const val = v[f || 'ru']; return val == null ? m : val; }); }
  function chip(spec, pool, v) {
    const wrong = /:wrong$/.test(spec); const icon = (v && v.icon) || ICON[pool] || '•';
    if (pool === 'contacts') return { icon: icon, main: v.ru + ' (' + v.rel_ru + ')', wrong: false };
    return { icon: icon, main: wrong ? v.wrong_ru : v.ru, wrong: wrong };
  }

  // One dialogue: same facts for the same session + scenario + round.
  function buildInstance(sessionId, scenarioId, round) {
    const sc = BY_ID[scenarioId]; if (!sc) throw new Error('Unknown scenario ' + scenarioId);
    const base = { instance_id: sessionId + '_' + scenarioId + '_r' + round, scenario_id: scenarioId, round: round, type: sc.type, domain: sc.domain, title: sc.title };
    if (sc.type === 'conv') return Object.assign(base, { questions: sc.q, cmds: sc.cmd, n: null });
    const rnd = rngFor(sessionId + '|' + scenarioId + '|' + round);
    const spec = sc.slots || {}; const used = {}; const slots = {};
    Object.keys(spec).forEach(function (key) {
      const pool = spec[key]; const items = POOLS[pool]; used[pool] = used[pool] || {};
      let idx = 0, tries = 0; do { idx = Math.floor(rnd() * items.length); tries++; } while (used[pool][idx] && tries < 60);
      used[pool][idx] = true; slots[key] = items[idx];
    });
    const steps = sc.steps.map(function (s) {
      const chips = (s.show || []).map(function (c) { const key = c.split(':')[0]; return chip(c, spec[key], slots[key]); });
      const sl = {}; (s.show || []).forEach(function (c) { const key = c.split(':')[0]; const w = /:wrong$/.test(c); sl[key + (w ? '_wrong' : '')] = w ? slots[key].wrong_en : slots[key].en; });
      return { role: s.r, ru: fill(s.ru, slots), en: fill(s.en, slots), chips: chips, meta: { intent: s.intent || '', acts: s.acts || [], slots: sl, self_chosen: false } };
    });
    return Object.assign(base, { steps: steps, n: steps.length });
  }

  // Who is the user in dialogue d: the first person (a) on even dialogues, the second (b) on odd ones.
  function userOf(d) { return d % 2 === 0 ? 'a' : 'b'; }
  function other(p) { return p === 'a' ? 'b' : 'a'; }

  // The card for turn t (q = current question of a conversation, qt = turn at which it was asked). Returns { role, owner, ru, en, chips, meta, conv }.
  function stepFor(inst, d, t, q, qt) {
    const user = userOf(d);
    if (inst.type === 'task') {
      const s = inst.steps[Math.min(t, inst.n - 1)];
      return Object.assign({}, s, { owner: s.role === 'user' ? user : other(user) });
    }
    const qs = inst.questions; const cur = qs[Math.min(q, qs.length - 1)];
    // the command rides only on the first answer to that question (qt = the turn at which question q was asked)
    const cmd = t === (qt || 0) + 1 ? inst.cmds.filter(function (c) { return c.at === q; })[0] : null;
    if (t % 2 === 0) {          // the phone (assistant) speaks
      let ru, en, acts;
      if (t === 0) { ru = 'Salaam karein aur apne alfaaz mein yeh poochein: “' + cur.ru + '”'; en = 'Greet them and ask, in your own words: “' + cur.en + '”'; acts = ['greeting', 'question']; }
      else if (q >= qs.length) { ru = 'Sawal khatam. Jitni der chahein unki baat par aur sawal poochein — ya “Guftagu khatam” dabayein.'; en = 'Questions done. Keep asking follow-ups as long as you like — or press “End conversation”.'; acts = ['follow_up', 'question']; }
      else { ru = 'Unki baat par follow-up sawal poochein. Jab chahein, “Agla sawal” dabayein. Abhi ka sawal: “' + cur.ru + '”'; en = 'Ask a follow-up on what they said. When ready, press “Next question”. Current question: “' + cur.en + '”'; acts = ['follow_up', 'question']; }
      return { role: 'assistant', owner: other(user), ru: ru, en: en, chips: [], conv: true, meta: { intent: '', acts: acts, slots: {}, self_chosen: false, q: q } };
    }
    let ru = 'Apne alfaaz mein jawab dein — jitna chahein bolein.', en = 'Answer in your own words — talk as long as you like.', intent = 'chat', acts = ['answer'], self = false;
    if (cmd) { ru += ' Baat ke beech yeh bhi kahein: ' + cmd.ru; en += ' During your answer, also tell the phone: ' + cmd.en; intent = cmd.intent; acts = ['answer'].concat(cmd.acts); self = true; }
    return { role: 'user', owner: user, ru: ru, en: en, chips: [], conv: true, meta: { intent: intent, acts: acts, slots: {}, self_chosen: self, q: q } };
  }

  // Session queue: 1 task, then (1 conversation + ~2-3 tasks) repeated; tasks in 3 rounds with new facts;
  // afterwards conversations again (round 2) and more task rounds, so there is always something next.
  function buildQueue(sessionId) {
    const rnd = rngFor(sessionId + '|queue');
    const convs = shuffle(CONVS.map(function (c) { return { scenario_id: c.id, round: 1 }; }), rnd);
    const tasks = [];
    for (let r = 1; r <= 3; r++) shuffle(TASKS.map(function (t) { return { scenario_id: t.id, round: r }; }), rnd).forEach(function (x) { tasks.push(x); });
    const per = Math.max(1, Math.round(tasks.length / convs.length));
    const q = []; let ci = 0, ti = 0; q.push(tasks[ti++]);
    while (ci < convs.length || ti < tasks.length) { if (ci < convs.length) q.push(convs[ci++]); for (let j = 0; j < per && ti < tasks.length; j++) q.push(tasks[ti++]); }
    for (let r = 2; r <= 6; r++) {
      const c2 = shuffle(CONVS.map(function (c) { return { scenario_id: c.id, round: r }; }), rngFor(sessionId + '|c|' + r));
      const t2 = shuffle(TASKS.map(function (t) { return { scenario_id: t.id, round: r + 2 }; }), rngFor(sessionId + '|t|' + r));
      c2.forEach(function (c, i) { q.push(c); if (t2[i]) q.push(t2[i]); });
    }
    return q;
  }

  window.PP_SCEN = { POOLS: POOLS, TASKS: TASKS, CONVS: CONVS, BY_ID: BY_ID, buildInstance: buildInstance, buildQueue: buildQueue, stepFor: stepFor, userOf: userOf };
})();
