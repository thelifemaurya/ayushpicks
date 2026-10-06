export type EditorialGuide = {
  slug: string
  title: string
  excerpt: string
  updatedAt: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const editorialGuides: EditorialGuide[] = [
  {
    slug: 'how-to-choose-products-worth-buying',
    title: 'How to choose products worth buying online',
    excerpt: 'A practical framework for comparing products without letting ratings, discounts or marketing copy make the decision for you.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Start with the problem, not the product', paragraphs: [
        'The easiest way to make a poor purchase is to start with a product name and then look for reasons to buy it. Start with the job you need the product to do. Write down the one or two outcomes that matter most, then ignore features that do not help with those outcomes.',
        'For example, a person choosing headphones may care primarily about calls and comfort, while another person may care about gaming latency. The same product can therefore be a sensible choice for one person and a poor fit for another.'
      ]},
      { heading: 'Separate facts from selling points', paragraphs: [
        'Product listings mix specifications, claims, descriptions and promotional language. Treat them differently. A measurable specification is useful when it is relevant to your decision; a broad phrase such as “premium experience” tells you much less by itself.',
        'At AYUSHPICKS, we try to keep factual product information separate from our editorial explanation. When a detail can change over time, such as price or availability, check the retailer before completing a purchase.'
      ]},
      { heading: 'Compare the details that actually change your decision', paragraphs: [
        'Make a short comparison list before opening ten product pages. Depending on the category, that can include size, compatibility, warranty, included items, power requirements, material, connectivity, or other relevant specifications.',
        'Do not compare every possible specification just because it is available. A useful comparison is selective: it focuses on the details that distinguish the options for the intended use.'
      ]},
      { heading: 'Treat discounts and ratings as signals, not conclusions', paragraphs: [
        'A large discount does not automatically mean a product is a good value. The original price shown by a retailer may change, and a lower price can still represent poor value if the product does not meet your needs.',
        'Ratings can help identify patterns worth investigating, but a rating alone does not tell you whether the reviewers had the same priorities as you. Read enough detail to understand what people liked or disliked and whether those points matter to your use case.'
      ]},
      { heading: 'Use a simple final check', paragraphs: [
        'Before buying, ask three questions: Does it solve the problem I started with? Are there any important compromises I have overlooked? Have I checked the current price, availability and retailer terms?',
        'If the answer to all three is clear, the decision becomes much easier. Good product discovery is not about finding the most impressive listing; it is about finding the option that makes sense for the person using it.'
      ]}
    ]
  },
  {
    slug: 'how-ayushpicks-evaluates-products',
    title: 'How AYUSHPICKS evaluates products',
    excerpt: 'Our editorial approach to product discovery, including what we look for, what we avoid and how affiliate links fit into the site.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Our purpose', paragraphs: [
        'AYUSHPICKS is designed to reduce the work involved in comparing online products. We are not the retailer and we do not process your order. Our job is to add context so that a product listing is easier to understand and compare.',
        'A product is not included simply because it is available online. The information on the page should give a reader a practical reason to consider the product and enough context to decide whether it fits their needs.'
      ]},
      { heading: 'What we look at', paragraphs: [
        'The exact criteria depend on the category, but our process starts with the product information available to us and the needs a typical buyer may have. We look for relevant specifications, compatibility or use constraints, notable advantages, meaningful trade-offs and information that could affect the buying decision.',
        'We avoid treating a single number, rating or promotional claim as a complete assessment. Context matters, and the useful comparison points differ from category to category.'
      ]},
      { heading: 'Our editorial layer', paragraphs: [
        'Retailer information can help establish product facts, but AYUSHPICKS should add its own explanation. Short descriptions, reasons for considering a product, pros and things to consider are written as editorial context rather than copied listing text.',
        'Where information is incomplete or uncertain, we prefer to leave it out rather than invent a specification, feature, price or performance claim. Prices and availability are treated as changeable information and should be verified at the retailer.'
      ]},
      { heading: 'Affiliate transparency', paragraphs: [
        'Some links on AYUSHPICKS may be affiliate links. If you purchase through one of those links, we may receive a commission at no additional cost to you. That commercial relationship does not change the need for useful and honest editorial information.',
        'AYUSHPICKS does not handle payment, shipping or returns for retailer purchases. The final transaction takes place on the retailer website, where current terms should be reviewed.'
      ]},
      { heading: 'Keeping the process useful', paragraphs: [
        'We would rather publish fewer useful pages than fill the site with repetitive product descriptions. Our goal is to make each guide and product page answer a real question a buyer could have before spending money.',
        'This policy also means that drafts produced with software or AI are not intended to bypass editorial review. Published material should be checked for accuracy, clarity, originality and usefulness before it becomes part of AYUSHPICKS.'
      ]}
    ]
  },
  {
    slug: 'how-to-compare-products-online',
    title: 'How to compare products online without getting overwhelmed',
    excerpt: 'A repeatable way to narrow a long list of products into a small, useful shortlist.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Define your must-haves', paragraphs: [
        'Start by writing down the requirements that would make a product unusable for you. Compatibility, size, operating system support, connectivity, capacity or another category-specific requirement can belong here.',
        'This first filter is more useful than starting with a “best product” list because it removes products that cannot meet your needs regardless of how attractive their marketing looks.'
      ]},
      { heading: 'Create a shortlist', paragraphs: [
        'Once the non-negotiables are clear, reduce the options to a handful. A shortlist makes detailed comparison possible without turning the process into endless scrolling.',
        'If two products are effectively identical for your use, you do not need a long argument between them. Move on to the differences that could actually change your decision.'
      ]},
      { heading: 'Look for trade-offs', paragraphs: [
        'Every product choice involves trade-offs. A smaller device may be easier to carry but offer less space. A feature-rich option may cost more or introduce complexity. A lower-priced option may require accepting a limitation that matters to you.',
        'A useful comparison makes those trade-offs visible instead of pretending that one product is perfect for everyone.'
      ]},
      { heading: 'Check the source before buying', paragraphs: [
        'Once you have a preferred option, verify the current retailer listing. Check the final price, availability, seller information where relevant, included items, warranty information and return terms.',
        'Product information can change after an editorial page is published. The retailer is the place to confirm the transaction-specific details before you buy.'
      ]}
    ]
  },
  {
    slug: 'how-to-read-product-reviews',
    title: 'How to read product reviews more intelligently',
    excerpt: 'Reviews are useful when you know how to separate recurring evidence from isolated opinions.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Do not stop at the star rating', paragraphs: [
        'A star rating compresses many different experiences into one number. It cannot tell you whether a reviewer cared about the same things you care about.',
        'Use the rating as a starting signal, then read the written feedback for recurring strengths, recurring complaints and comments that relate directly to your intended use.'
      ]},
      { heading: 'Look for patterns', paragraphs: [
        'One unusual complaint may not describe the typical experience. Multiple independent comments describing the same issue are more useful for identifying something worth investigating.',
        'The same applies to praise. A repeated positive observation can be meaningful, but it should still be considered alongside the product specifications and your own requirements.'
      ]},
      { heading: 'Consider the reviewer’s situation', paragraphs: [
        'A reviewer may have a different device, environment, budget, expectation or use case. That context can completely change whether a particular experience is relevant to you.',
        'The best review for your decision is not necessarily the most enthusiastic one. It is the one whose circumstances and criteria are closest to yours.'
      ]},
      { heading: 'Use reviews to find questions', paragraphs: [
        'A good review often gives you a question to verify rather than a final answer. If several people mention compatibility, durability or a missing accessory, check the official product information and current retailer listing for that specific point.',
        'This approach turns reviews into research leads and reduces the risk of making a purchase based on one person’s experience.'
      ]}
    ]
  },
  {
    slug: 'how-to-spot-a-bad-deal',
    title: 'How to spot a bad deal disguised as a discount',
    excerpt: 'A discount label can be useful, but it should never be the main reason you buy a product.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Ask whether you needed it anyway', paragraphs: [
        'The first test is simple: would you still want the product if there were no discount badge? If the answer is no, the discount may be creating the reason to buy rather than helping you save on something you already need.',
        'A lower price is only useful when the product itself is useful to you.'
      ]},
      { heading: 'Check the actual price', paragraphs: [
        'Retail prices can move over time. Compare the current selling price with recent prices when reliable information is available, and do not assume that the crossed-out amount represents what the product normally costs.',
        'For the final transaction, always verify the live retailer price because the price shown on an editorial page may become outdated.'
      ]},
      { heading: 'Check what is included', paragraphs: [
        'A deal can look attractive until you discover that an accessory, subscription, replacement part or other necessary item is separate. The relevant comparison is the cost of getting the complete setup you actually need.',
        'Read the included-items information carefully and compare like with like.'
      ]},
      { heading: 'Compare alternatives', paragraphs: [
        'Before buying, compare at least one or two realistic alternatives. You may discover that another product offers the same useful capability without the features or compromises you do not need.',
        'The goal is not to chase the biggest discount. It is to find a purchase whose price makes sense for the value and requirements that matter to you.'
      ]}
    ]
  },
  {
    slug: 'online-shopping-checklist-before-buying',
    title: 'The online shopping checklist to use before you buy',
    excerpt: 'A compact final checklist covering product fit, price, seller details, returns and other purchase-critical information.',
    updatedAt: '2026-09-15',
    sections: [
      { heading: 'Product fit', paragraphs: [
        'Confirm that the product works for the device, space, platform or use case you actually have. Compatibility mistakes are easy to make when shopping from short product cards.',
        'Check dimensions and other physical requirements when they matter. A product that looks right in a listing can still be wrong for your setup.'
      ]},
      { heading: 'Price and availability', paragraphs: [
        'Check the current selling price at the retailer and look for any important additional costs shown during the transaction. Prices can change, so treat displayed editorial prices as a snapshot rather than a guarantee.',
        'Also confirm that the exact variant you intend to buy is available. Colour, size, storage, pack count and other variants can have different prices and specifications.'
      ]},
      { heading: 'Seller, warranty and returns', paragraphs: [
        'Review the retailer’s current seller information, warranty details and return policy where applicable. These terms can matter as much as the product specification for an expensive purchase.',
        'AYUSHPICKS does not control retailer policies. The retailer’s current terms should always be treated as the final source for the transaction.'
      ]},
      { heading: 'Final decision', paragraphs: [
        'If the product fits your needs, the current price makes sense, and you understand the important terms, you have done the useful part of the research. If one of those answers is unclear, pause before purchasing.',
        'A good buying process should make you more confident because you understand the decision, not because a page pushed you toward a checkout button.'
      ]}
    ]
  }
]

export function getEditorialGuide(slug: string) {
  return editorialGuides.find((guide) => guide.slug === slug)
}
