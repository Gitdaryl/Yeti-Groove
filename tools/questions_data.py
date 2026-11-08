"""Question pages for yetigroove.com (read by tools/build_questions.py).

Picked from Google autocomplete, Nov 7 2026 (about 30 seeds, 900 suggestions). Each page answers in the first two
sentences, then explains, then points at the leak it belongs to in The Lost Customer Check.

Rules:
- General facts only from the listed sources. Quotes were checked word for word against each page on Nov 7 2026.
- Never stated here on purpose (no original publisher found): "62% of calls go unanswered", "85% won't call back",
  the "5 minutes vs 30 minutes" lead stat, "ChatGPT uses Bing", any BrightLocal percentage.
- Advice that is ours (not a sourced fact) is written as "we" or as plain how-to, never dressed up as a statistic.
- No em dashes.
"""

CHECKED = 'November 7, 2026'
DATE = '2026-11-07'

LEAKS = {
    'found': {'name': 'Getting found'},
    'answered': {'name': 'Getting answered'},
    'done': {'name': 'Getting it done'},
}

G_RANK = ('Google Business Profile Help: Tips to improve your local ranking on Google', 'https://support.google.com/business/answer/7091')
G_VERIFY = ('Google Business Profile Help: Verify your business on Google', 'https://support.google.com/business/answer/7107242')
G_EDITS = ('Google Business Profile Help: Understand what happens to your Business Profile edits', 'https://support.google.com/business/answer/3038311')
G_SAB = ('Google Business Profile Help: Manage your service areas', 'https://support.google.com/business/answer/9157481')
G_GUIDE = ('Google Business Profile Help: Guidelines for representing your business on Google', 'https://support.google.com/business/answer/3038177')
G_SUSP = ('Google Business Profile Help: Fix suspended or disabled profiles', 'https://support.google.com/business/answer/4569145')
OAI_BOTS = ('OpenAI: Overview of OpenAI crawlers', 'https://developers.openai.com/api/docs/bots')
G_AI = ('Google Search Central: AI features and your website', 'https://developers.google.com/search/docs/appearance/ai-features')
BING_AI = ('Bing Webmaster Blog: Introducing AI Performance in Bing Webmaster Tools (Feb 2026)',
           'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview')
G_REV_TIPS = ('Google Business Profile Help: Tips to get more reviews', 'https://support.google.com/business/answer/3474122')
G_REV_POLICY = ('Google Maps: Prohibited and restricted content (user contributed content policy)', 'https://support.google.com/contributionpolicy/answer/7400114')
G_REV_MANAGE = ('Google Business Profile Help: Manage customer reviews', 'https://support.google.com/business/answer/3474050')
FTC_QA = ('Federal Trade Commission: Consumer Reviews and Testimonials Rule, Questions and Answers (Nov 2024)',
          'https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers')
HBR = ('Harvard Business Review: The Short Life of Online Sales Leads (Oldroyd, McElheran and Elkington, March 2011)',
       'https://hbr.org/2011/03/the-short-life-of-online-sales-leads')
G_PHOTOS = ('Google Business Profile Help: Tips for business-specific photos', 'https://support.google.com/business/answer/6123536')
G_HOURS = ('Google Business Profile Help: How to set special hours', 'https://support.google.com/business/answer/6303076')
TWILIO = ('Twilio Docs: Programmable Messaging and A2P 10DLC', 'https://www.twilio.com/docs/messaging/compliance/a2p-10dlc')
CTIA = ('CTIA: Messaging Principles and Best Practices (May 2023)',
        'https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf')
IRS = ('IRS: Recordkeeping for small businesses', 'https://www.irs.gov/businesses/small-businesses-self-employed/recordkeeping')
SBA = ('U.S. Small Business Administration: Manage your finances', 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances')


def Q(text, src):
    return ('quote', f'&ldquo;{text}&rdquo;', src[0].split(':')[0])


QUESTIONS = [
    dict(
        slug='why-isnt-my-business-showing-up-on-google-maps', leak='found', date=DATE, checked=CHECKED,
        q="Why isn't my business showing up on Google Maps?",
        title="Why Isn't My Business Showing Up on Google Maps? | YetiGroove",
        desc="The usual reasons a business is missing from Google Maps, what Google says it ranks on, how long fixes take, and what to do if your profile was suspended.",
        answer="Usually it is one of four things: the profile is not verified, its details are incomplete or wrong, Google sees other businesses "
               "as a better or closer match for the search, or the profile broke one of Google's rules. Google says local results are mainly "
               "based on relevance, distance and popularity, and there is no way to pay for a better spot.",
        sections=[
            ('What Google looks at', [
                "Google is plain about this. It ranks local results on how well your profile matches the search, how far you are from the "
                "person searching, and how well known your business is.",
                Q("Local results are mainly based on relevance, distance, and popularity.", G_RANK),
                "That third one includes reviews. Google says more reviews and positive ratings can help your local ranking, and so can other "
                "websites linking to you. You can't change how far a customer is from you, so the other two are where the work is.",
            ]),
            ('Check these first', [
                ('list', [
                    "<b>Is the profile verified?</b> Google says verifying tells it you are authorized to represent the business, so it is more "
                    "likely to show up in search results.",
                    "<b>Are the details complete and correct?</b> Google warns that if your info isn't accurate, your profile might not show up "
                    "for relevant searches in your area. Check the hours, phone number, website and services.",
                    "<b>Is your main category right?</b> Google asks you to choose the fewest categories that describe your core business. "
                    "A deck builder listed only as \"Contractor\" is easy to miss.",
                    "<b>Is the name just your name?</b> Adding extra words to the business name, like a town or a service, isn't allowed and "
                    "can get the profile suspended.",
                    "<b>Do you work at customers' homes?</b> Then you are a service-area business. Google says to hide your address, and lets you "
                    "set up to 20 service areas, no more than about two hours' drive from where you are based. It won't take a radius.",
                    "<b>Is there more than one profile?</b> Google allows one profile per business. Duplicates split your reviews and confuse it.",
                ]),
            ]),
            ('How long a fix takes to show', [
                "Don't expect to see changes the same afternoon. These are Google's own timings:",
                ('list', [
                    "Verification reviews take up to 5 business days, and on rare occasions longer.",
                    "Edits usually take up to 10 minutes to review, but sometimes up to 30 days.",
                    "Service area changes may take up to 48 hours to show once approved.",
                ]),
            ]),
            ('If your profile has disappeared', [
                "If it was there and now it's gone, it may have been suspended or disabled. Google says it may suspend or disable profiles that "
                "don't follow its guidelines, and a removed profile can't be seen by the public.",
                Q("Appeals can only be submitted once.", G_SUSP),
                "So fix the cause before you appeal. The usual causes are the ones in the list above: extra words in the name, a home address "
                "shown for a service-area business, or a duplicate profile.",
            ]),
        ],
        check_h='We check where you show up, from where your customers are',
        check_p="In the check, we search for your trade in your own town and the towns around it, compare your profile with the business "
                "that ranks first, and list exactly what is missing.",
        sources=[G_RANK, G_VERIFY, G_EDITS, G_SAB, G_GUIDE, G_SUSP],
    ),
    dict(
        slug='how-to-get-my-business-on-chatgpt', leak='found', date=DATE, checked=CHECKED,
        q='How do I get my business to show up on ChatGPT?',
        title='How Do I Get My Business to Show Up on ChatGPT? | YetiGroove',
        desc="How ChatGPT search finds websites, the one setting that can keep you out, and what Google says about showing up in its AI answers.",
        answer="Make sure your website lets OpenAI's search crawler in, then make your business easy to describe: clear pages that say what "
               "you do and where, with the same name, phone number and details everywhere you are listed. For Google's AI answers, Google "
               "says there are no special tricks. If your page shows in normal search, it can appear there too.",
        sections=[
            ('Let the right crawler in', [
                "ChatGPT's search uses a crawler called OAI-SearchBot to find websites. If your site blocks it, you won't be shown in ChatGPT "
                "search answers.",
                Q("To help ensure your site appears in search results, we recommend allowing OAI-SearchBot in your site's robots.txt file&hellip;", OAI_BOTS),
                "Your website person can check this in a minute. OpenAI says it can take about 24 hours for a change to that file to take effect.",
                "There is a separate crawler, GPTBot, that collects pages for training AI models. Blocking GPTBot does not keep you out of "
                "search, so you can say no to training and still be found.",
            ]),
            ("Google's AI answers work like normal search", [
                "Google's AI Overviews and AI Mode don't have a separate sign-up or a secret recipe.",
                Q("There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.", G_AI),
                "Google says a page has to be indexed and eligible to show in normal search first, and that showing up isn't guaranteed. So the "
                "work is the same work that gets you found on Google at all.",
            ]),
            ('Be easy to describe', [
                "This part is our advice rather than a rule from either company. AI answers repeat what they can find and confirm, so give them "
                "something clear to find:",
                ('list', [
                    "A page for each service you offer, in plain words, with the towns you cover.",
                    "The same business name, address, phone number and hours on your website, Google profile, Facebook page and any directories.",
                    "Recent reviews that mention the work you actually do.",
                    "Short, straight answers to the questions customers ask you, like this page.",
                ]),
                "Microsoft now shows site owners how often their pages appear in Copilot and Bing's AI summaries, in a free report inside "
                "Bing Webmaster Tools. It's worth setting up so you can see it change.",
            ]),
        ],
        check_h='We ask the AI tools about your trade, in your town',
        check_p="In the check, we ask ChatGPT, Google's AI answers and Copilot who to call for your kind of work near you, note who gets "
                "named, and check whether your site lets the search crawlers in.",
        sources=[OAI_BOTS, G_AI, BING_AI],
    ),
    dict(
        slug='how-to-get-more-google-reviews', leak='found', date=DATE, checked=CHECKED,
        q='How do I get more Google reviews without being pushy?',
        title='How Do I Get More Google Reviews Without Being Pushy? | YetiGroove',
        desc="Ask every customer the day the job wraps, with a direct link. What Google allows, what it bans, and how to reply to reviews.",
        answer="Ask every customer, the day the job wraps, with a direct link or QR code to your Google review page, and reply to the "
               "reviews you get. Don't offer anything in return and don't ask only the happy customers: Google prohibits both.",
        sections=[
            ('Make it one tap', [
                "The biggest reason people don't leave a review is that it takes effort to find where. Google gives every business a direct link.",
                Q("To leave reviews, you can ask customers to visit a Google link or scan a QR code.", G_REV_TIPS),
                "Text the link the same day you finish the job, while they're still pleased. Put the QR code on the invoice and on a card the "
                "crew can hand over. Customers need to be signed into a Google account to leave a review, so a phone usually works best.",
            ]),
            ('Ask everyone, and ask the same way', [
                "Asking every customer is not pushy. Asking only the ones you think are happy breaks Google's rules. Google says businesses may "
                "not discourage negative reviews or selectively solicit positive ones.",
                Q("When soliciting reviews, merchants should not require or pressure users to leave ratings or write reviews while on the premises, nor should they request that specific content be included.", G_REV_POLICY),
                "So no standing over someone while they type, and no telling them what to write. A short text with the link and a thank-you does the job.",
            ]),
            ("What you can't do", [
                Q("Offering incentives, like free or discounted goods or services, in exchange for customers to post reviews, change reviews, or remove negative reviews is considered fake &amp; misleading content and is strictly prohibited.", G_REV_TIPS),
                "You may read that the Federal Trade Commission allows some review incentives. It does, as long as the reward doesn't depend on "
                "what the review says. Google is stricter and bans incentives outright, so if you want reviews on Google, follow Google's rule.",
                "Reviews from staff or family count as a conflict of interest under Google's policy, including former employees. Leave them out.",
            ]),
            ('Reply to every review', [
                "Google says helpful replies show you're responsive, and the customer gets notified when you reply. Thank people by name for "
                "good ones. For a bad one, say what you will do about it, calmly, in two or three sentences. Other customers read the reply more "
                "closely than the review.",
                Q("A mix of positive and negative feedback often feels more trustworthy.", G_REV_TIPS),
            ]),
        ],
        check_h='We count your reviews against the business ranked first',
        check_p="In the check, we compare your review count, how recent they are and how you reply with the top business in your area, and "
                "look at how and when you currently ask.",
        sources=[G_REV_TIPS, G_REV_POLICY, G_REV_MANAGE, FTC_QA],
    ),
    dict(
        slug='how-to-get-more-leads-contractor', leak='answered', date=DATE, checked=CHECKED,
        q='How do I get more leads for my contracting business?',
        title='How Do I Get More Leads for My Contracting Business? | YetiGroove',
        desc="Before buying more leads, answer the ones you get faster and look better on Google. What a well-known Harvard Business Review study found about response time.",
        answer="Before you pay for more leads, answer the ones you already get faster. A well-known Harvard Business Review study found that "
               "companies that tried to reach a lead within an hour were nearly seven times as likely to have a real conversation as those "
               "that waited even an hour longer. Then make sure your Google profile shows your work.",
        sections=[
            ('Speed decides most jobs', [
                "In 2011, researchers writing in Harvard Business Review sent a test inquiry to 2,241 U.S. companies and timed the replies. "
                "37% answered within an hour. 24% took more than a day. 23% never answered at all. Among those that did reply within 30 days, "
                "the average wait was 42 hours.",
                "A second study in the same article looked at 1.25 million leads. Companies that tried to make contact within an hour were "
                "nearly seven times as likely to reach a decision maker as those that tried an hour later, and more than 60 times as likely "
                "as those that waited a day or more.",
                "The study is old and looked mostly at larger companies, not contractors. But anyone who has hired a contractor knows the "
                "pattern: the first one to call back usually gets the visit.",
            ]),
            ('Show your work on Google', [
                "When someone searches for your trade, your Google profile is often the first thing they see, before your website.",
                Q("Photos help customers quickly understand the type of work you do. Add at least three photos that are representative of the services you offer.", G_PHOTOS),
                "Three is Google's minimum. Most good contractors have hundreds of job photos sitting on crew phones. Google also says the "
                "business must be verified for photos to show, and that complete, accurate profiles are more likely to appear in local results.",
            ]),
            ('Make the first step easy', [
                "This is our advice from building these for trades. A customer ready to call should never have to hunt:",
                ('list', [
                    "Your phone number at the top of every page, one tap to call on a phone.",
                    "A short form: name, phone, what they need. Every extra question loses people.",
                    "Every form and missed call answered by text within minutes, even if it's only to set a time to talk.",
                    "Reviews visible, because the next thing a customer does is check them.",
                ]),
            ]),
            ('Then think about buying leads', [
                "Paid ads and lead services send people to the same profile, the same reviews and the same phone. If those are slow or thin, "
                "you pay for leads that go to the competitor who answered first. Fix the leak, then turn up the tap.",
            ]),
        ],
        check_h='We send you a lead and time the reply',
        check_p="In the check, we fill in your form, call and message you like a real customer, do the same to the business ranked above "
                "you, and show you both timelines side by side.",
        sources=[HBR, G_PHOTOS, G_RANK],
    ),
    dict(
        slug='what-happens-when-customers-call-after-hours', leak='answered', date=DATE, checked=CHECKED,
        q='What happens when a customer calls my business after hours?',
        title='What Happens When a Customer Calls My Business After Hours? | YetiGroove',
        desc="Test it yourself tonight. Why reply speed matters, keeping your Google hours right, and what to know before you set up automatic text replies.",
        answer="Call your own number at seven tonight and find out. If it rings out or the voicemail is full, that customer is waiting on "
               "you while other businesses are a tap away. Make sure every after-hours call gets a quick reply: a text back within seconds, "
               "or an answering service or voice assistant that takes their details for the morning.",
        sections=[
            ('Test it yourself', [
                "Most owners have never heard their own business from the outside after hours. It takes two minutes:",
                ('list', [
                    "Call your main number after closing. Does it ring, go to voicemail, or say the box is full?",
                    "Listen to the greeting. Does it say when you will call back?",
                    "Fill in your own website form. How long until anyone sees it?",
                    "Message your Facebook page. Who gets the notification?",
                ]),
            ]),
            ('Why speed matters', [
                "A well-known 2011 Harvard Business Review study timed how 2,241 U.S. companies answered a web inquiry. 23% never answered at "
                "all, and the average reply took 42 hours. A second study in the same article found companies that tried to make contact within "
                "an hour were nearly seven times as likely to reach a decision maker as those that tried an hour later.",
                "A call at 7 pm that gets answered at 9 the next morning is already 14 hours behind.",
            ]),
            ('Keep your hours honest on Google', [
                "People check your hours on Google before they call. Google suggests confirming your hours for holidays even if they don't change.",
                Q("You can set special hours if your business temporarily adjusts its hours of operation or remains closed for up to 6 days in a row.", G_HOURS),
                "If you'll be closed seven days or more in a row, Google says to mark the business as temporarily closed instead.",
            ]),
            ('Before you set up automatic texts', [
                "A missed-call text back is one of the simplest fixes there is, but texting from a business system has rules.",
                Q("Anyone sending SMS/MMS messages over a 10DLC number from an application to the US must register for A2P 10DLC.", TWILIO),
                "Twilio says registered numbers get less filtering, and unregistered ones pay extra carrier fees. The phone industry's own "
                "guidelines ask for standard STOP wording so people can opt out, and one final confirmation once they do.",
                "When we set this up, we register the number, keep the reply to answering the customer's own call, and include opt-out wording. "
                "If texts are part of your marketing too, have the consent wording on your forms checked.",
            ]),
        ],
        check_h='We call you after hours',
        check_p="In the check, we call at seven at night, fill in your form and message your page, then write up exactly what happened, "
                "minute by minute, next to the business that ranks above you.",
        sources=[HBR, G_HOURS, TWILIO, CTIA],
    ),
    dict(
        slug='how-to-run-my-small-business-more-efficiently', leak='done', date=DATE, checked=CHECKED,
        q='How do I run my small business more efficiently?',
        title='How Do I Run My Small Business More Efficiently? | YetiGroove',
        desc="Follow one job from the first call to the final invoice and write down every retype, chase and memory step. Then fix the biggest one first.",
        answer="Follow one job from the first phone call to the final invoice, and write down every time someone types the same thing "
               "twice, chases something, or relies on memory. Fix the biggest of those first, usually by connecting the tools you already "
               "pay for, not by buying new ones.",
        sections=[
            ('Follow one job', [
                "Software shows you how the business is supposed to run. Following one real job shows you how it actually runs. Pick a "
                "normal job, not a disaster, and trace it: the call, the quote, the schedule, the materials, the crew, the photos, the invoice, "
                "the payment. Every hand-off is a place where something gets retyped, waits, or gets forgotten.",
            ]),
            ('Ask three questions', [
                "These are the same three we ask on the form for The Lost Customer Check, because they find most of it:",
                ('list', [
                    "<b>What gets done twice?</b> The same name, address and scope typed into a quote, then the accounting, then the calendar.",
                    "<b>What sits waiting on one person?</b> The quote only the owner can write. The answer only the office manager knows.",
                    "<b>What only works because somebody remembers it?</b> The step that isn't written down anywhere, until that person is on vacation.",
                ]),
            ]),
            ('Keep records in one place', [
                "Scattered records cost time every day and real money at tax time. The IRS puts it plainly:",
                Q("Good records will help you monitor the progress of your business, prepare your financial statements, identify sources of income, keep track of deductible expenses&hellip;", IRS),
                "The SBA says the same about bookkeeping: maintaining it properly can help keep your business running smoothly. One place where "
                "each job lives, with its photos, paperwork and money, does more than any new app.",
            ]),
            ("Don't rip out what works", [
                "Replacing a system your people already know is expensive and usually the wrong answer. Most of the lost time lives in the gaps "
                "between tools: the estimate that doesn't become the job, the photos that don't leave the phone. Connect those first.",
                "Then sort what's left. Some work can run on its own. Some should go straight to the right person. The judgement calls, like "
                "pricing a tricky job, stay with you, with the numbers lined up so it takes ten minutes instead of an evening.",
            ]),
        ],
        check_h='We follow one of your jobs',
        check_p="In the check, we spend a day following one real job from first call to final invoice, write down every retype and chase, "
                "and switch one fix on before we leave.",
        sources=[IRS, SBA],
    ),
]
