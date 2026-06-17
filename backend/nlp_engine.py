class NLPEngine:
    def __init__(self):
        self.languages = ["en", "te", "hi"]
        self.knowledge_base = {
            "batteries": {
                "en": "Batteries are hazardous waste. Do NOT throw them in regular bins. Take them to a specialized collection point.",
                "te": "బ్యాటరీలు ప్రమాదకరమైనవి. వాటిని సాధారణ చెత్త బుట్టల్లో వేయకండి. ప్రత్యేక సేకరణ కేంద్రానికి తీసుకెళ్లండి.",
                "hi": "बैटरियां खतरनाक कचरा हैं। उन्हें सामान्य कूड़ेदान में न फेंकें। उन्हें एक विशेष संग्रह केंद्र पर ले जाएं।"
            },
            "pizza box": {
                "en": "If the box is oily, it's non-recyclable (Green Bin). If clean, it's recyclable (Blue Bin).",
                "te": "పెట్టె నూనెగా ఉంటే, అది రీసైకిల్ చేయలేనిది (గ్రీన్ బిన్). శుభ్రంగా ఉంటే, అది రీసైకిల్ చేయదగినది (బ్లూ బిన్).",
                "hi": "यदि बॉक्स तैलीय है, तो यह पुनर्चक्रण योग्य नहीं है (हरा कूड़ेदान)। यदि साफ है, तो यह पुनर्चक्रण योग्य है (नीला कूड़ेदान)।"
            }
        }

    def get_response(self, query, lang="en"):
        query = query.lower()
        for key in self.knowledge_base:
            if key in query:
                return self.knowledge_base[key].get(lang, self.knowledge_base[key]["en"])
        
        fallback = {
            "en": "I'm not sure about that item. Generally, dry waste goes to Blue and wet waste to Green.",
            "te": "ఆ అంశం గురించి నాకు ఖచ్చితంగా తెలియదు. సాధారణంగా, పొడి చెత్త బ్లూకు మరియు తడి చెత్త గ్రీన్‌కు వెళ్తుంది.",
            "hi": "मुझे उस वस्तु के बारे में यकीन नहीं है। आमतौर पर, सूखा कचरा नीला और गीला कचरा हरा में जाता है।"
        }
        return fallback.get(lang, fallback["en"])

nlp_engine = NLPEngine()
