/**
 * Kareway Health — default action set + categories
 * Color tokens picked to match the oklch design system (warm clinical).
 * `iconKey` references KwIcon names (no clipart, no emoji on cards).
 */

const TONE = {
    medical:   { color: "#a25249", tint: "#f5e8e3" }, // oklch(0.58 0.10 25)  warm rose
    comfort:   { color: "#5a7da3", tint: "#e8eef5" }, // oklch(0.55 0.07 230) warm blue
    needs:     { color: "#a78346", tint: "#f5ecdc" }, // oklch(0.62 0.08 80)  warm amber
    movement:  { color: "#7170a8", tint: "#ebe8f5" }, // oklch(0.55 0.07 285) desat violet
    social:    { color: "#7c8b7e", tint: "#e8efe9" }, // oklch(0.60 0.04 145) sage
    emergency: { color: "#cf3a2e", tint: "#f7dcd6" }, // oklch(0.58 0.18 25)  clinical red
    brand:     { color: "#3a8e88", tint: "#d6e8e6" }, // oklch(0.55 0.08 175) Kareway green
};

const DEFAULT_ACTIONS = [
    /* ── Medical ── */
    { id: "1",  iconKey: "alert",      labelTamil: "எனக்கு வலி உள்ளது",                 labelEnglish: "I am in pain",            audioTextTamil: "எனக்கு வலி உள்ளது, உதவி தேவை",        audioTextEnglish: "I am in pain, I need help",                category: "medical",   ...TONE.medical },
    { id: "5",  iconKey: "back",       labelTamil: "என் முதுகில் வலி உள்ளது",          labelEnglish: "My back hurts",           audioTextTamil: "என் முதுகில் வலி உள்ளது",            audioTextEnglish: "My back is hurting",                       category: "medical",   ...TONE.medical },
    { id: "6",  iconKey: "handLeft",   labelTamil: "என் இடது கையில் வலி உள்ளது",      labelEnglish: "Left hand pain",          audioTextTamil: "என் இடது கையில் வலி உள்ளது",         audioTextEnglish: "My left hand is in pain",                  category: "medical",   ...TONE.medical },
    { id: "7",  iconKey: "handRight",  labelTamil: "என் வலது கையில் வலி உள்ளது",      labelEnglish: "Right hand pain",         audioTextTamil: "என் வலது கையில் வலி உள்ளது",         audioTextEnglish: "My right hand is in pain",                 category: "medical",   ...TONE.medical },
    { id: "8",  iconKey: "neck",       labelTamil: "என் கழுத்தில் வலி உள்ளது",         labelEnglish: "Neck pain",               audioTextTamil: "என் கழுத்தில் வலி உள்ளது",          audioTextEnglish: "My neck is hurting",                       category: "medical",   ...TONE.medical },
    { id: "14", iconKey: "leg",        labelTamil: "என் காலில் வலி உள்ளது",            labelEnglish: "My leg hurts",            audioTextTamil: "என் காலில் வலி உள்ளது",             audioTextEnglish: "My leg is in pain",                        category: "medical",   ...TONE.medical },
    { id: "20", iconKey: "mouth",      labelTamil: "என் வாயில் ஏதோ உள்ளது",          labelEnglish: "Something in my mouth",   audioTextTamil: "என் வாயில் ஏதோ உள்ளது",            audioTextEnglish: "There is something in my mouth",            category: "medical",   ...TONE.medical },
    { id: "16", iconKey: "pill",       labelTamil: "மருந்து வேண்டும்",                 labelEnglish: "I need medication",       audioTextTamil: "மருந்து நேரம், மருந்து கொடுங்கள்",   audioTextEnglish: "I need my medication, please",              category: "medical",   ...TONE.medical },
    { id: "30", iconKey: "nausea",     labelTamil: "குமட்டல்",                         labelEnglish: "I feel nauseous",         audioTextTamil: "எனக்கு குமட்டல் ஏற்படுகிறது",        audioTextEnglish: "I feel nauseous",                          category: "medical",   ...TONE.medical },
    { id: "31", iconKey: "chest",      labelTamil: "மார்பு இறுக்கம்",                  labelEnglish: "Chest tightness",         audioTextTamil: "என் மார்பில் இறுக்கம் உள்ளது",      audioTextEnglish: "I am feeling tightness in my chest",        category: "medical",   ...TONE.medical },

    /* ── Comfort ── */
    { id: "12", iconKey: "head",       labelTamil: "தலையை சரி செய்யுங்கள்",            labelEnglish: "Adjust my head",          audioTextTamil: "தலையை சரி செய்யுங்கள்",             audioTextEnglish: "Please adjust my head position",            category: "comfort",   ...TONE.comfort },
    { id: "13", iconKey: "pillow",     labelTamil: "தலையணையை சரி செய்யுங்கள்",          labelEnglish: "Adjust my pillow",        audioTextTamil: "தலையணையை சரி செய்யுங்கள்",          audioTextEnglish: "Please adjust my pillow",                  category: "comfort",   ...TONE.comfort },
    { id: "15", iconKey: "legAdjust",  labelTamil: "காலை சரி செய்யுங்கள்",             labelEnglish: "Adjust my leg",           audioTextTamil: "காலை சரி செய்யுங்கள்",              audioTextEnglish: "Please adjust my leg position",             category: "comfort",   ...TONE.comfort },
    { id: "18", iconKey: "moon",       labelTamil: "தூங்க வேண்டும்",                    labelEnglish: "I need to sleep",         audioTextTamil: "தூங்க வேண்டும்",                    audioTextEnglish: "I want to sleep",                          category: "comfort",   ...TONE.comfort },
    { id: "21", iconKey: "scratch",    labelTamil: "எனக்கு சொருகுங்கள்",                labelEnglish: "Scratch me",              audioTextTamil: "எனக்கு சொருகுங்கள்",                audioTextEnglish: "Please scratch me, I have an itch",         category: "comfort",   ...TONE.comfort },
    { id: "32", iconKey: "snowflake",  labelTamil: "எனக்கு குளிர்கிறது",               labelEnglish: "I feel cold",             audioTextTamil: "எனக்கு குளிர்கிறது, போர்வை வேண்டும்", audioTextEnglish: "I feel cold, may I have a blanket",         category: "comfort",   ...TONE.comfort },
    { id: "33", iconKey: "sun",        labelTamil: "எனக்கு சூடாக உள்ளது",              labelEnglish: "I feel hot",              audioTextTamil: "எனக்கு சூடாக உள்ளது",               audioTextEnglish: "I feel hot",                                category: "comfort",   ...TONE.comfort },
    { id: "19", iconKey: "mosquito",   labelTamil: "கொசு தொந்தரவு",                   labelEnglish: "Mosquito disturbance",    audioTextTamil: "கொசு தொந்தரவு, உதவுங்கள்",          audioTextEnglish: "Mosquitoes are disturbing me",              category: "comfort",   ...TONE.comfort },

    /* ── Needs ── */
    { id: "4",  iconKey: "drop",       labelTamil: "எனக்கு தண்ணீர் வேண்டும்",            labelEnglish: "I need water",            audioTextTamil: "எனக்கு தண்ணீர் வேண்டும்",            audioTextEnglish: "I need water please",                       category: "needs",     ...TONE.needs },
    { id: "3",  iconKey: "bathroom",   labelTamil: "சிறுநீர் போக வேண்டும்",             labelEnglish: "I need the toilet",       audioTextTamil: "சிறுநீர் போக வேண்டும்",            audioTextEnglish: "I need to use the toilet",                  category: "needs",     ...TONE.needs },
    { id: "34", iconKey: "food",       labelTamil: "எனக்கு பசிக்கிறது",                labelEnglish: "I am hungry",             audioTextTamil: "எனக்கு பசிக்கிறது",                 audioTextEnglish: "I am feeling hungry",                       category: "needs",     ...TONE.needs },

    /* ── Movement ── */
    { id: "2",  iconKey: "block",      labelTamil: "நான் நகர முடியவில்லை",              labelEnglish: "I can't move",            audioTextTamil: "நான் நகர முடியவில்லை, உதவி செய்யுங்கள்", audioTextEnglish: "I cannot move, please help me",          category: "movement",  ...TONE.movement },
    { id: "9",  iconKey: "flex",       labelTamil: "கைக்கு உடற்பயிற்சி செய்ய உதவுங்கள்", labelEnglish: "Help with hand exercise", audioTextTamil: "கைக்கு உடற்பயிற்சி செய்ய உதவுங்கள்", audioTextEnglish: "Please help me with hand exercise",         category: "movement",  ...TONE.movement },
    { id: "10", iconKey: "headRotate", labelTamil: "தலைக்கு உடற்பயிற்சி செய்ய உதவுங்கள்",labelEnglish: "Help with head exercise", audioTextTamil: "தலைக்கு உடற்பயிற்சி செய்ய உதவுங்கள்", audioTextEnglish: "Please help me with head exercise",         category: "movement",  ...TONE.movement },
    { id: "11", iconKey: "bed",        labelTamil: "படுக்கையில் திருப்பி விடுங்கள்",     labelEnglish: "Turn me on the bed",      audioTextTamil: "படுக்கையில் திருப்பி விடுங்கள்",     audioTextEnglish: "Please turn me on the bed",                category: "movement",  ...TONE.movement },
    { id: "17", iconKey: "chair",      labelTamil: "உட்கார வேண்டும்",                  labelEnglish: "I need to sit up",        audioTextTamil: "உட்கார வேண்டும், உதவுங்கள்",        audioTextEnglish: "I need to sit up, please help me",          category: "movement",  ...TONE.movement },

    /* ── Social ── */
    { id: "40", iconKey: "hello",      labelTamil: "வணக்கம்",                          labelEnglish: "Hello",                    audioTextTamil: "வணக்கம், எப்படி இருக்கிறீர்கள்",     audioTextEnglish: "Hello, how are you",                        category: "social",    ...TONE.social },
    { id: "41", iconKey: "heart",      labelTamil: "நன்றி",                             labelEnglish: "Thank you",                audioTextTamil: "மிக்க நன்றி",                       audioTextEnglish: "Thank you very much",                       category: "social",    ...TONE.social },
    { id: "42", iconKey: "yes",        labelTamil: "ஆம்",                               labelEnglish: "Yes",                      audioTextTamil: "ஆம், அதுதான்",                      audioTextEnglish: "Yes",                                       category: "social",    ...TONE.social },
    { id: "43", iconKey: "no",         labelTamil: "இல்லை",                             labelEnglish: "No",                       audioTextTamil: "இல்லை, வேண்டாம்",                   audioTextEnglish: "No, thank you",                             category: "social",    ...TONE.social },

    /* ── Emergency ── */
    { id: "23", iconKey: "siren",      labelTamil: "உதவி வேண்டும்",                    labelEnglish: "Emergency help",          audioTextTamil: "உதவி, உடனடியாக வாருங்கள்",          audioTextEnglish: "Help! Please come immediately!",            category: "emergency", ...TONE.emergency },
];

export const CATEGORIES = {
    all:       { iconKey: "catAll",       labelTamil: "அனைத்தும்",     labelEnglish: "All",       color: "#857c70", tint: "#f0eeea" },
    medical:   { iconKey: "catMedical",   labelTamil: "மருத்துவம்",   labelEnglish: "Medical",   color: TONE.medical.color,   tint: TONE.medical.tint },
    comfort:   { iconKey: "catComfort",   labelTamil: "தேவைகள்",     labelEnglish: "Comfort",   color: TONE.comfort.color,   tint: TONE.comfort.tint },
    needs:     { iconKey: "drop",         labelTamil: "தேவைகள்",     labelEnglish: "Needs",     color: TONE.needs.color,     tint: TONE.needs.tint },
    movement:  { iconKey: "catMovement",  labelTamil: "உடல் இயக்கம்", labelEnglish: "Movement",  color: TONE.movement.color,  tint: TONE.movement.tint },
    social:    { iconKey: "hello",        labelTamil: "சமூகம்",        labelEnglish: "Social",    color: TONE.social.color,    tint: TONE.social.tint },
    emergency: { iconKey: "catEmergency", labelTamil: "அவசரம்",       labelEnglish: "Emergency", color: TONE.emergency.color, tint: TONE.emergency.tint },
};

/* Time-of-day suggestion sets — referenced by SuggestionsStrip */
export const SUGGESTIONS = {
    morning:   ["1", "4", "3", "16", "12", "41"],          // pain, water, toilet, meds, head, thanks
    afternoon: ["1", "4", "12", "16", "32", "41"],         // pain, water, head, meds, cold, thanks
    evening:   ["18", "4", "32", "12", "41", "13"],        // sleep, water, cold, head, thanks, pillow
};

export { TONE };
export default DEFAULT_ACTIONS;
