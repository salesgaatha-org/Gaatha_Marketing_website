# AI chatbots for websites and WhatsApp: a guide for brands

> An AI chatbot for a website or WhatsApp answers customer questions in natural language from your own catalogue, FAQs and policies, looks up live data such as order status, captures leads and hands complex conversations to a person. Unlike older rule-based bots, it understands free text, including Hindi, Gujarati and Hinglish. For most Indian brands WhatsApp is the higher-value channel, but it needs the WhatsApp Business API, approved templates and customer opt-in.

- Page: https://gaa-tha.com/blog/ai-chatbot-for-website-and-whatsapp
- Category: AI & Software
- Published: 2026-10-22
- Author: gaa-tha (https://gaa-tha.com/about)

## Key takeaways

- AI chatbots understand free text and answer from your own content; rule-based bots only follow menus.
- WhatsApp needs the Business API through Meta or a BSP, approved templates and opt-in; check Meta’s current pricing.
- Sync the catalogue and policies rather than pasting them into a prompt, and test on real customer questions.
- Reply in the customer’s language and script, and always offer a clear route to a person.
- Measure verified resolution, handoff reasons and commercial outcomes, not chat volume.

## What can a modern AI chatbot do that old rule-based bots could not?

A modern AI chatbot understands free-text questions, answers from your own content and looks up live data, where an old rule-based bot could only follow button menus and keyword matches.

| Aspect | Rule-based bot | AI chatbot |
|---|---|---|
| Input | Buttons and exact keywords | Free text, voice notes, typos, mixed languages |
| Knowledge | Answers typed into a flow builder | Your catalogue, FAQs and policies, retrieved at answer time |
| Live data | Rarely | Order status, stock, delivery estimates by pincode, appointment slots |
| When it fails | Loops back to the menu | Can sound confident and be wrong, unless grounded and tested |
| Maintenance | Every new question needs a new branch | Update the source document; the bot follows |

Buttons still have a place: for payments, address confirmation or choosing a size, a tap is faster and safer than typing. The best bots mix free-text understanding with structured buttons where precision matters.

A typical exchange shows the difference. A customer writes “is the vitamin C serum ok for oily skin and will it reach Surat by Friday?”. A rule bot matches “serum” and shows a product menu. An AI chatbot answers the suitability question from the product’s own ingredient notes, checks the delivery estimate for the customer’s pincode, and offers a button to order or to ask a skincare adviser.

## How does the WhatsApp Business API work for brands?

The WhatsApp Business API, now called the WhatsApp Business Platform, lets a business connect WhatsApp to software, such as a chatbot, CRM or shared inbox, instead of replying from a phone app. The essentials:

- **Access.** Connect directly through Meta’s Cloud API, or through a Business Solution Provider (BSP) such as Gupshup, Interakt, AiSensy, WATI, Twilio or 360dialog, which adds an inbox, broadcasts, flow builders and support.

- **Set-up.** A Meta Business account, a verified business for higher limits, an approved display name and a dedicated phone number.

- **The 24-hour window.** When a customer messages you, you can reply freely for 24 hours. Outside that window you may only send pre-approved templates.

- **Templates.** Each template is approved by Meta and belongs to a category: marketing, utility (order updates, payment reminders) or authentication (one-time passwords). Each language version needs its own approval.

- **Opt-in.** Customers must agree to receive messages from you; collect consent at checkout or on forms and record it.

- **Pricing.** Meta used to charge per 24-hour conversation and moved in 2025 to charging per delivered template message, with rates by category and country; replies inside the customer service window are not charged. Rules and rates change, so check Meta’s current pricing for India and your BSP’s fees.

- **Quality and limits.** Blocks and reports lower your quality rating, which can reduce how many people you can message per day.

Meta’s terms also do not allow general-purpose AI assistants on the platform; a bot that serves your own customers about your products, orders and services is the intended use.

A website chat widget is simpler: no Meta approvals, no template rules and no per-message charges, and it can be added to a Shopify theme or any site with a script. It suits pre-purchase questions from web visitors and international customers, and it can hand the conversation over to WhatsApp when the customer prefers.

## How do you train a chatbot on your catalogue, FAQs and policies?

You train a business chatbot by connecting it to clean source content that it searches at answer time, not by retraining a model. The sources that matter:

- **Catalogue:** synced from Shopify or your ERP through the API, with prices, variants, stock, ingredients or specifications, so answers never go stale.

- **Policies:** shipping times by region, COD rules, returns, exchanges, warranty, cancellations.

- **FAQs and guides:** size charts, usage instructions, care, compatibility, B2B minimum order quantities.

- **Past conversations:** the questions customers really ask, mined from WhatsApp and email history.

Then write the rules: tone of voice, what it must never say (medical claims for skincare, promised delivery dates it cannot check, discounts it has no authority to give), and when to hand over. Before launch, test it against a hundred or more real questions and fix the source content, not just the prompt, wherever it gets something wrong. Policies written as short, direct question-and-answer pairs (“Can I return a product after opening it? No, except for damage in transit, reported within 48 hours.”) give far better answers than long legal pages. The approach is the same retrieval method described in our [guide to AI agents for business](https://gaa-tha.com/blog/ai-agents-for-business-guide).

## Can an AI chatbot reply in Hindi, Gujarati and Hinglish?

Yes. Current large language models handle Hindi and Hinglish well and Gujarati reasonably well, but you must test with real customer messages before launch. Indian customers write in Devanagari, in Gujarati script and in romanised forms such as “maro order kyare aavse?”, often mixing English product names in the same sentence. Set the bot to reply in the language and script the customer used, transcribe voice notes, which are common on WhatsApp, and keep product names, prices and order numbers in a consistent form. Decide in advance how the bot handles prices and quantities, so “do sau rupaye” and “₹200” are read the same way. Remember that templates sent outside the 24-hour window need an approved version in each language you use. For international customers, the same set-up works for English, French or any other language you serve.

## How should handoff, order tracking and lead capture work?

### Human handoff

Hand over to a person whenever the customer asks for one, sounds angry, raises a refund or damage claim, or the bot fails to answer twice. Pass the full transcript and order details so the customer never repeats themselves, show business hours honestly, and route to a shared inbox in your BSP or helpdesk, such as Freshdesk, Zoho Desk or Gorgias.

### Shopify order tracking

Identify the customer by WhatsApp number or order number plus a verification detail, fetch the order from the Shopify Admin API, and pull the latest courier scan from Shiprocket, Delhivery or your aggregator. Explain the status in plain words with an expected date. The same flow can confirm COD orders and reschedule failed deliveries, which reduces return-to-origin losses; our post on [COD vs prepaid](https://gaa-tha.com/blog/cod-vs-prepaid) explains why. Clean order and tracking data starts with the [Shopify build](https://gaa-tha.com/services/shopify-development) itself.

### Lead capture

For B2B and high-ticket brands, ask two or three qualifying questions in conversation, such as quantity, city and timeline, then create the lead in your CRM and offer a call slot. Click-to-WhatsApp ads on Meta feed this flow directly, and the routing behind it is covered in our guide to [AI workflow automation](https://gaa-tha.com/blog/ai-workflow-automation-n8n-make-zapier).

## Which metrics show whether a chatbot is working?

Measure verified resolution and business outcomes, not the number of chats. Track:

- **Resolution rate:** conversations closed without a person, checked by sampling, not assumed.

- **Handoff rate and reasons:** which questions the bot cannot answer yet.

- **Wrong-answer rate:** from a weekly review of a random sample.

- **First response time and customer satisfaction.**

- **Commercial outcomes:** orders or leads from chat, COD confirmation rate, RTO change, lead-to-meeting rate.

- **Cost per conversation,** including model usage, BSP and Meta charges.

Review these weekly for the first two months, then monthly. The handoff reasons are the most useful list you will get: each one is either a gap in your content, a missing integration, or a question that genuinely needs a person.

## What mistakes should brands avoid with AI chatbots?

The common mistakes are about scope, data and honesty, not technology:

1. Launching on every channel at once instead of proving one.

2. Copy-pasting the catalogue into a prompt instead of syncing it, so prices and stock go stale.

3. Hiding the human option; customers who cannot reach a person leave.

4. Pretending the bot is a person; say it is an assistant.

5. Sending marketing templates without clear opt-in, which damages your quality rating.

6. Letting the bot promise refunds, discounts or delivery dates it cannot check.

7. Never reading the transcripts after launch.

8. Measuring success by chat volume rather than resolved questions and orders.

The clear, question-shaped answers you write for the bot also help elsewhere: the same FAQ content, published on your site, is what search engines and AI answer engines quote, which is the focus of our [SEO, AEO and GEO](https://gaa-tha.com/services/seo-aeo-geo) work.

gaa-tha designs and builds website and WhatsApp assistants under [AI chatbot development](https://gaa-tha.com/services/ai-chatbot-development), connected to Shopify, CRMs and helpdesks, and extends them into [AI agents](https://gaa-tha.com/services/ai-agent-development) when they need to act across more systems.

## Frequently asked questions

### Can I use my existing WhatsApp Business app number with the API?

Often, yes. Meta now lets many businesses use the WhatsApp Business app and the platform on the same number, with some feature limits; otherwise the number moves from the app to the API. Check the current options with Meta or your BSP before you switch.

### What does a WhatsApp AI chatbot cost to run?

Running cost has four parts: the BSP subscription if you use one, Meta’s charges for template messages, AI model usage per conversation, and maintenance. Replies inside the 24-hour customer service window are not charged by Meta, so support-led bots cost far less to run than broadcast-heavy ones.

### Will an AI chatbot make up answers?

It can if it answers from the model’s general knowledge. Grounding answers in your own catalogue and policies, telling it to hand over when unsure, and reviewing transcripts weekly keeps wrong answers rare and quickly corrected.

### Should we start with a website chatbot or WhatsApp?

For most Indian consumer brands, start with WhatsApp, because that is where customers already ask about orders and products. A website chat widget suits brands with high-intent web traffic, international customers or longer pre-purchase questions.

### Can a WhatsApp chatbot take payments?

Yes, most simply by sending a Razorpay, Cashfree or UPI payment link and confirming payment by webhook. Native payments inside WhatsApp in India are available through supported payment partners; check eligibility with your BSP.

### How long does it take to launch an AI chatbot?

A focused chatbot covering FAQs and order status can usually launch in a few weeks, including WhatsApp approvals and testing. Lead qualification, CRM integration and multiple languages add time, mostly for testing with real conversations.

## Related gaa-tha services

- [AI Chatbot Development](https://gaa-tha.com/services/ai-chatbot-development): Website and WhatsApp chatbots that know your catalogue and policies, capture leads and hand over to a person when it matters.
- [AI Agent Development](https://gaa-tha.com/services/ai-agent-development): Custom AI agents that take a goal, use your tools and finish the task — inside guardrails, approvals and logs.
- [Shopify Store Design & Development](https://gaa-tha.com/services/shopify-development): Shopify stores designed for conversion and built for speed — custom themes, custom sections and the checkout integrations Indian D2C brands need.
- [AI Workflow Automation](https://gaa-tha.com/services/ai-workflow-automation): Automations across your apps, with AI steps that read, sort and write — so data moves without copy-paste.

---

**About gaa-tha** — gaa-tha is a storytelling-led digital marketing, branding, ecommerce, technology and AI agency founded in Gujarat, India in 2024. It builds brands, websites, Shopify stores, mobile apps, SaaS products, AI agents, automations and ERPs; runs Meta and Google ads, social media and SEO/AEO/GEO; and onboards and manages brands on Amazon, Flipkart, Myntra, Blinkit, Zepto and Swiggy Instamart.

Contact: digimarketing@gaa-tha.com · +91 97372 80309 · https://gaa-tha.com/#contact · All services: https://gaa-tha.com/services · Site summary for AI assistants: https://gaa-tha.com/llms.txt
