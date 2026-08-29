export type Language = "en" | "bn";

export interface Translations {
  nav: {
    dashboard: string;
    reports: string;
    ghush: string;
    lostFound: string;
    housing: string;
    services: string;
    parking: string;
    transport: string;
    utilities: string;
    login: string;
    register: string;
    logout: string;
    profile: string;
    admin: string;
    authority: string;
    officer: string;
    citizen: string;
    gridSubtitle: string;
  };
  dashboard: {
    badge: string;
    guestBadge: string;
    citizenBadge: string;
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroDesc: string;
    vitals: {
      activeCitizens: string;
      activeCitizensLabel: string;
      reportsResolved: string;
      reportsResolvedLabel: string;
      verifiedPros: string;
      verifiedProsLabel: string;
      whistleblowerProtected: string;
      whistleblowerProtectedLabel: string;
    };
    modules: {
      reportsTitle: string;
      reportsTagline: string;
      reportsDesc: string;
      reportsTag: string;
      reportsAction: string;
      reportsSecondary: string;

      ghushTitle: string;
      ghushTagline: string;
      ghushDesc: string;
      ghushTag: string;
      ghushAction: string;
      ghushSecondary: string;

      lostFoundTitle: string;
      lostFoundTagline: string;
      lostFoundDesc: string;
      lostFoundTag: string;
      lostFoundAction: string;
      lostFoundSecondary: string;

      housingTitle: string;
      housingTagline: string;
      housingDesc: string;
      housingTag: string;
      housingAction: string;
      housingSecondary: string;

      servicesTitle: string;
      servicesTagline: string;
      servicesDesc: string;
      servicesTag: string;
      servicesAction: string;
      servicesSecondary: string;

      parkingTitle: string;
      parkingTagline: string;
      parkingDesc: string;
      parkingTag: string;
      parkingAction: string;
      parkingSecondary: string;
    };
  };
  reports: {
    title: string;
    subtitle: string;
    fileNew: string;
    filterAll: string;
    filterPending: string;
    filterInProgress: string;
    filterResolved: string;
    noReports: string;
    location: string;
    category: string;
    status: string;
    support: string;
    viewDetails: string;
    formTitle: string;
    formDesc: string;
    titleLabel: string;
    titlePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    categoryLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    uploadLabel: string;
    submitBtn: string;
    anonymousNotice: string;
  };
  ghush: {
    title: string;
    subtitle: string;
    badge: string;
    submitDossier: string;
    exploreVault: string;
    anonymityBadge: string;
    amountDemanded: string;
    accusedDept: string;
    evidenceCount: string;
    statusVerified: string;
    statusPending: string;
    statusInvestigating: string;
    dossierTitle: string;
    dossierDesc: string;
    deptLabel: string;
    amountLabel: string;
    officerNameLabel: string;
    submitClaim: string;
    zeroKnowledgeText: string;
  };
  lostFound: {
    title: string;
    subtitle: string;
    postItem: string;
    lostTab: string;
    foundTab: string;
    allCategories: string;
    claimItem: string;
    verifiedOwner: string;
    reward: string;
    formTitle: string;
    itemTypeLabel: string;
    lostRadio: string;
    foundRadio: string;
    itemNameLabel: string;
    itemDescLabel: string;
    contactInfoLabel: string;
    submitPost: string;
  };
  housing: {
    title: string;
    subtitle: string;
    listRental: string;
    rentLabel: string;
    trustScore: string;
    verifiedTenant: string;
    bedrooms: string;
    bathrooms: string;
    reviewLandlord: string;
    formTitle: string;
    flatTitleLabel: string;
    rentPriceLabel: string;
    addressLabel: string;
    amenitiesLabel: string;
    submitRental: string;
  };
  services: {
    title: string;
    subtitle: string;
    registerTrade: string;
    vettedPros: string;
    rating: string;
    emergencyCall: string;
    bookService: string;
    allTrades: string;
    formTitle: string;
    tradeTypeLabel: string;
    experienceLabel: string;
    contactLabel: string;
    hourlyRateLabel: string;
    submitProfile: string;
  };
  parking: {
    title: string;
    subtitle: string;
    findParking: string;
    manageBookings: string;
    manageVehicles: string;
    violations: string;
    availableBays: string;
    hourlyRate: string;
    bookBay: string;
    activeSensors: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    districtLabel: string;
    roleLabel: string;
    citizenRole: string;
    officerRole: string;
    loginButton: string;
    registerButton: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    forgotPassword: string;
    systemOnline: string;
  };
  common: {
    search: string;
    filter: string;
    viewAll: string;
    openModule: string;
    submit: string;
    cancel: string;
    loading: string;
    back: string;
    save: string;
    delete: string;
    edit: string;
    systemOnline: string;
    noData: string;
    success: string;
    error: string;
    viewOnMap: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: "Dashboard",
      reports: "Reports",
      ghush: "Anti-Bribery",
      lostFound: "Lost & Found",
      housing: "Housing",
      services: "Services",
      parking: "Parking",
      transport: "Transit",
      utilities: "Utilities",
      login: "Sign In",
      register: "Register",
      logout: "Sign Out",
      profile: "My Profile",
      admin: "Admin Oversight",
      authority: "Authority Command",
      officer: "Field Integrity",
      citizen: "Citizen Portal",
      gridSubtitle: "Civic Transparency Grid",
    },
    dashboard: {
      badge: "VERIFIED CIVIC GRID",
      guestBadge: "GUEST EXPLORER",
      citizenBadge: "CITIZEN ACCESS",
      heroTitlePrefix: "",
      heroTitleHighlight: "Unified Citizen Transparency & Public Grid.",
      heroDesc:
        "Empowering citizens across Bangladesh with verified public issue reporting, encrypted corruption whistleblowing, authentic rental reviews, and secure municipal services.",
      vitals: {
        activeCitizens: "140K+",
        activeCitizensLabel: "Verified Citizens",
        reportsResolved: "94.2%",
        reportsResolvedLabel: "Resolution Rate",
        verifiedPros: "4,800+",
        verifiedProsLabel: "Vetted Trades",
        whistleblowerProtected: "100%",
        whistleblowerProtectedLabel: "Encrypted Anonymity",
      },
      modules: {
        reportsTitle: "Citizen Issue Reports",
        reportsTagline: "EMERGENCY & PUBLIC SAFETY",
        reportsDesc:
          "Report road hazards, power outages, and sanitation issues with geolocation and track resolution live.",
        reportsTag: "Live Ticker",
        reportsAction: "File Report",
        reportsSecondary: "Public Ledger",

        ghushTitle: "Anti-Corruption & Whistleblower",
        ghushTagline: "ENCRYPTED EVIDENCE VAULT",
        ghushDesc:
          "Expose bribery demands, extortion, and official misconduct with zero-knowledge encrypted anonymity.",
        ghushTag: "100% Anonymous",
        ghushAction: "Submit Dossier",
        ghushSecondary: "Claim Radar",

        lostFoundTitle: "Civic Lost & Found",
        lostFoundTagline: "CUSTODY & RECOVERY HUB",
        lostFoundDesc:
          "Report lost valuables (NID cards, keys, phones) and match found items with secure ownership verification.",
        lostFoundTag: "Verified Claims",
        lostFoundAction: "Post Item",
        lostFoundSecondary: "Lost Directory",

        housingTitle: "Housing & Landlord Ratings",
        housingTagline: "TRANSPARENT TENANT REVIEWS",
        housingDesc:
          "Browse verified residential rentals, review tenant policies, and rate landlord integrity.",
        housingTag: "Tenant Verified",
        housingAction: "List Rental",
        housingSecondary: "Browse Flats",

        servicesTitle: "Local Services Directory",
        servicesTagline: "WARD TRADES & EMERGENCY",
        servicesDesc:
          "Hire background-checked electricians, plumbers, appliance technicians, and emergency trades.",
        servicesTag: "Licensed Trades",
        servicesAction: "Register Trade",
        servicesSecondary: "Find Pros",

        parkingTitle: "Metropolitan Parking Hub",
        parkingTagline: "AUTONOMOUS LIDAR SENSORS",
        parkingDesc:
          "Search available slots, book contactless passes, and manage your vehicle RFID tags seamlessly.",
        parkingTag: "Live Occupancy",
        parkingAction: "Find Parking",
        parkingSecondary: "Manage Fleet",
      },
    },
    reports: {
      title: "Civic Incident Ledger",
      subtitle: "Transparent citizen issue reporting and resolution tracking across all wards.",
      fileNew: "File New Report",
      filterAll: "All Reports",
      filterPending: "Pending Review",
      filterInProgress: "In Resolution",
      filterResolved: "Resolved",
      noReports: "No incident reports found matching this criteria.",
      location: "Location",
      category: "Category",
      status: "Status",
      support: "Citizen Endorsements",
      viewDetails: "View Full Dossier",
      formTitle: "Submit Civic Issue Report",
      formDesc: "Pinpoint emergency road hazards, drainage clogs, or public safety issues with photographic evidence.",
      titleLabel: "Incident Title",
      titlePlaceholder: "e.g. Broken water pipeline at Banani Road 11",
      descLabel: "Detailed Description",
      descPlaceholder: "Provide clear details, landmarks, and severity...",
      categoryLabel: "Incident Category",
      locationLabel: "Location Address",
      locationPlaceholder: "e.g. House 42, Road 7, Block C",
      uploadLabel: "Attach Proof Photos",
      submitBtn: "Dispatch Report",
      anonymousNotice: "Reports are publicly logged with cryptographic transparency.",
    },
    ghush: {
      title: "Anti-Corruption & Whistleblower Vault",
      subtitle: "Zero-knowledge encrypted repository for exposing bribery, extortion, and public misconduct.",
      badge: "Cryptographic Anonymity Grid",
      submitDossier: "Submit Encrypted Dossier",
      exploreVault: "Browse Evidence Ledger",
      anonymityBadge: "100% Identity Protected",
      amountDemanded: "Bribe Demanded",
      accusedDept: "Department / Office",
      evidenceCount: "Evidence Files",
      statusVerified: "Verified Authentic",
      statusPending: "Awaiting Verification",
      statusInvestigating: "Investigation Active",
      dossierTitle: "Submit Whistleblower Evidence",
      dossierDesc: "Upload documents, audio recordings, or transaction records. Your IP and identity are never stored.",
      deptLabel: "Government Body / Office",
      amountLabel: "Demanded Amount (BDT)",
      officerNameLabel: "Accused Official (Optional)",
      submitClaim: "Lodge Whistleblower Dossier",
      zeroKnowledgeText: "Protected by client-side SHA-256 evidence hashing.",
    },
    lostFound: {
      title: "Civic Lost & Found Vault",
      subtitle: "Secure digital recovery network for lost identification, valuables, and keys across Bangladesh.",
      postItem: "Post New Item",
      lostTab: "Lost Valuables",
      foundTab: "Found Items (Safe Custody)",
      allCategories: "All Categories",
      claimItem: "Submit Ownership Claim",
      verifiedOwner: "Verified Ownership Required",
      reward: "Reward Offered",
      formTitle: "Post Lost or Found Item",
      itemTypeLabel: "Report Type",
      lostRadio: "I Lost Something",
      foundRadio: "I Found Something",
      itemNameLabel: "Item Name & Model",
      itemDescLabel: "Description & Identifying Marks",
      contactInfoLabel: "Secure Contact / Ward Info",
      submitPost: "Publish to Recovery Ledger",
    },
    housing: {
      title: "Verified Housing & Tenant Reviews",
      subtitle: "Transparent residential rentals, landlord integrity ratings, and authentic tenant policies.",
      listRental: "List a Flat / House",
      rentLabel: "Monthly Rent",
      trustScore: "Landlord Integrity Score",
      verifiedTenant: "Tenant Verified Review",
      bedrooms: "Bedrooms",
      bathrooms: "Baths",
      reviewLandlord: "Rate Landlord & Premises",
      formTitle: "List Residential Rental",
      flatTitleLabel: "Property Title",
      rentPriceLabel: "Monthly Rent (BDT)",
      addressLabel: "Full Address & Ward",
      amenitiesLabel: "Amenities & Features",
      submitRental: "Publish Verified Listing",
    },
    services: {
      title: "Local Services & Vetted Pros",
      subtitle: "Background-checked municipal trades, electricians, plumbers, and emergency technicians.",
      registerTrade: "Register as Pro Trade",
      vettedPros: "Background Verified",
      rating: "Citizen Rating",
      emergencyCall: "Emergency Direct Call",
      bookService: "Book Service",
      allTrades: "All Professions",
      formTitle: "Trade Professional Registration",
      tradeTypeLabel: "Trade Category (Electrician, Plumber, etc.)",
      experienceLabel: "Years of Experience",
      contactLabel: "Phone / Emergency WhatsApp",
      hourlyRateLabel: "Base Service Charge (BDT)",
      submitProfile: "Register Trade Profile",
    },
    parking: {
      title: "Metropolitan Smart Parking Hub",
      subtitle: "Real-time LiDAR occupancy sensors, contactless RFID gate access, and spot reservation.",
      findParking: "Find Live Parking",
      manageBookings: "My Parking Passes",
      manageVehicles: "Registered Vehicles",
      violations: "Violations & Appeals",
      availableBays: "Available Bays",
      hourlyRate: "Hourly Rate",
      bookBay: "Pre-Book Parking Slot",
      activeSensors: "LiDAR Grid Online",
    },
    auth: {
      loginTitle: "Citizen & Authority Portal",
      loginSubtitle: "Civic transparency, whistleblower vaults, and public services in one place.",
      registerTitle: "Join Prottoy",
      registerSubtitle: "Empower your community and access municipal services.",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      nameLabel: "Full Name",
      namePlaceholder: "e.g. Khalid Hasan",
      phoneLabel: "Phone Number",
      districtLabel: "District",
      roleLabel: "Account Role",
      citizenRole: "Citizen Explorer",
      officerRole: "Field Officer",
      loginButton: "Sign In to Prottoy",
      registerButton: "Create Account",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already registered?",
      forgotPassword: "Forgot password?",
      systemOnline: "System Online & Secure",
    },
    common: {
      search: "Search...",
      filter: "Filter",
      viewAll: "View All",
      openModule: "Launch Module",
      submit: "Submit",
      cancel: "Cancel",
      loading: "Loading...",
      back: "Back",
      save: "Save Changes",
      delete: "Delete",
      edit: "Edit",
      systemOnline: "System Online & Secure",
      noData: "No records found.",
      success: "Operation successful!",
      error: "An error occurred. Please try again.",
      viewOnMap: "View on Map",
    },
  },
  bn: {
    nav: {
      dashboard: "ড্যাশবোর্ড",
      reports: "গণঅভিযোগ",
      ghush: "দুর্নীতি প্রতিরোধ",
      lostFound: "হারানো ও প্রাপ্তি",
      housing: "আবাসন",
      services: "সেবা ও কারিগর",
      parking: "পার্কিং",
      transport: "ট্রান্সপোর্ট",
      utilities: "ইউটিলিটি",
      login: "লগইন",
      register: "নিবন্ধন",
      logout: "লগআউট",
      profile: "আমার প্রোফাইল",
      admin: "প্রশাসনিক প্যানেল",
      authority: "কর্তৃপক্ষ কমান্ড",
      officer: "ফিল্ড অফিসার",
      citizen: "নাগরিক পোর্টাল",
      gridSubtitle: "নাগরিক স্বচ্ছতা গ্রিড",
    },
    dashboard: {
      badge: "নাগরিক স্বচ্ছতা ও অধিকার গ্রিড",
      guestBadge: "অতিথি ভিউ",
      citizenBadge: "নাগরিক অ্যাক্সেস",
      heroTitlePrefix: "",
      heroTitleHighlight: "নাগরিক স্বচ্ছতা ও অধিকার প্রতিষ্ঠার জাতীয় প্ল্যাটফর্ম।",
      heroDesc:
        "বাংলাদেশের নাগরিকদের ক্ষমতায়নে গণঅভিযোগ দাখিল, দুর্নীতির বিরুদ্ধে গোপন তথ্য প্রদান, আবাসন যাচাই ও স্থানীয় জরুরি নাগরিক সেবা গ্রহণের নিরাপদ প্ল্যাটফর্ম।",
      vitals: {
        activeCitizens: "১,৪০,০০০+",
        activeCitizensLabel: "যাচাইকৃত নাগরিক",
        reportsResolved: "৯৪.২%",
        reportsResolvedLabel: "সমাধানের হার",
        verifiedPros: "৪,৮০০+",
        verifiedProsLabel: "যাচাইকৃত কারিগর",
        whistleblowerProtected: "১০০%",
        whistleblowerProtectedLabel: "সম্পূর্ণ গোপনীয়তা",
      },
      modules: {
        reportsTitle: "নাগরিক গণঅভিযোগ",
        reportsTagline: "জরুরি সমস্যা ও নাগরিক সুরক্ষা",
        reportsDesc:
          "রাস্তাঘাট, বিদ্যুৎ বিভ্রাট ও পরিচ্ছন্নতা সংক্রান্ত সমস্যা সরাসরি ম্যাপে চিহ্নিত করে রিপোর্ট করুন এবং লাইভ ট্র্যাকিং দেখুন।",
        reportsTag: "লাইভ ট্র্যাকার",
        reportsAction: "অভিযোগ দাখিল",
        reportsSecondary: "পাবলিক তালিকা",

        ghushTitle: "দুর্নীতি ও ঘুষ বিরোধী ভল্ট",
        ghushTagline: "এনক্রিপ্টেড হুইসেলব্লোয়ার প্ল্যাটফর্ম",
        ghushDesc:
          "ঘুষ দাবি, চাঁদাবাজি এবং প্রশাসনিক অনিয়মের প্রমাণ সম্পূর্ণ নাম প্রকাশ না করে নিরাপদ এনক্রিপশনের মাধ্যমে দাখিল করুন।",
        ghushTag: "১০০% গোপনীয়",
        ghushAction: "তথ্য জমা দিন",
        ghushSecondary: "দাবিকৃত রাডার",

        lostFoundTitle: "নাগরিক হারানো ও প্রাপ্তি ভল্ট",
        lostFoundTagline: "আইডি, চাবি ও মূল্যবান সামগ্রী উদ্ধার",
        lostFoundDesc:
          "হারানো জাতীয় পরিচয়পত্র, চাবি, মোবাইল পোস্ট করুন এবং সঠিক মালিকানা যাচাইয়ের মাধ্যমে ফিরিয়ে নিন।",
        lostFoundTag: "যাচাইকৃত দাবি",
        lostFoundAction: "পোস্ট করুন",
        lostFoundSecondary: "হারানো তালিকা",

        housingTitle: "আবাসন ও বাড়িওয়ালা রেটিং",
        housingTagline: "স্বচ্ছ ভাড়াটিয়া মূল্যায়ন ও যাচাই",
        housingDesc:
          "যাচাইকৃত ফ্ল্যাট ও বাড়ি ভাড়া খুঁজুন, ভাড়ার শর্তাবলী পর্যালোচনা করুন এবং বাড়িওয়ালার সততা রেটিং দিন।",
        housingTag: "ভাড়াটিয়া যাচাই",
        housingAction: "বাসা তালিকাভুক্তি",
        housingSecondary: "বাসা খুঁজুন",

        servicesTitle: "স্থানীয় কারিগর ও সেবা ডিরেক্টরি",
        servicesTagline: "পেশাদার ইলেকট্রিশিয়ান ও প্লাম্বার",
        servicesDesc:
          "আপনার ওয়ার্ডের ব্যাকগ্রাউন্ড যাচাইকৃত ইলেকট্রিশিয়ান, প্লাম্বার ও মেরামতকারী পেশাদারদের সহজে বুক করুন।",
        servicesTag: "লাইসেন্সপ্রাপ্ত কারিগর",
        servicesAction: "কারিগর যুক্ত করুন",
        servicesSecondary: "কারিগর খুঁজুন",

        parkingTitle: "স্মার্ট পার্কিং হাব",
        parkingTagline: "স্বয়ংক্রিয় লিডার সেন্সর পার্কিং",
        parkingDesc:
          "নিকটবর্তী খালি পার্কিং স্পট দেখুন, ডিজিটাল পাস বুক করুন এবং স্বয়ংক্রিয় গেট অ্যান্ট্রির সুবিধা নিন।",
        parkingTag: "রিয়েল-টাইম খালি স্পট",
        parkingAction: "পার্কিং খুঁজুন",
        parkingSecondary: "গাড়ির তালিকা",
      },
    },
    reports: {
      title: "গণঅভিযোগ ও সমস্যা ট্র্যাকার",
      subtitle: "সকল ওয়ার্ডের নাগরিক সমস্যার স্বচ্ছ ট্র্যাকিং ও দ্রুত সমাধান লেজার।",
      fileNew: "নতুন অভিযোগ দাখিল",
      filterAll: "সকল অভিযোগ",
      filterPending: "অপেক্ষারত",
      filterInProgress: "সমাধান চলছে",
      filterResolved: "সমাধান সম্পন্ন",
      noReports: "এই বিভাগে কোনো অভিযোগ পাওয়া যায়নি।",
      location: "অবস্থান",
      category: "ক্যাটাগরি",
      status: "অবস্থা",
      support: "নাগরিক সমর্থন",
      viewDetails: "সম্পূর্ণ বিবরণ দেখুন",
      formTitle: "নাগরিক অভিযোগ দাখিল করুন",
      formDesc: "রাস্তাঘাট, ড্রেনেজ বা জননিরাপত্তা সংক্রান্ত সমস্যার ছবি ও সঠিক লোকেশন প্রদান করুন।",
      titleLabel: "অভিযোগের শিরোনাম",
      titlePlaceholder: "যেমন: বনানী ১১ নম্বর রোডে ড্রেনের ঢাকনা খোলা",
      descLabel: "বিস্তারিত বিবরণ",
      descPlaceholder: "সমস্যার বিস্তারিত বিবরণ ও প্রয়োজনীয় তথ্য দিন...",
      categoryLabel: "সমস্যার ক্যাটাগরি",
      locationLabel: "সঠিক ঠিকানা ও লোকেশন",
      locationPlaceholder: "যেমন: বাড়ি ৪২, রোড ৭, ব্লক সি",
      uploadLabel: "প্রমাণের ছবি সংযুক্ত করুন",
      submitBtn: "অভিযোগ জমা দিন",
      anonymousNotice: "সকল অভিযোগ নাগরিক স্বচ্ছতার জন্য পাবলিক লেজারে সংরক্ষিত হয়।",
    },
    ghush: {
      title: "দুর্নীতি ও ঘুষ বিরোধী তথ্য ভল্ট",
      subtitle: "ঘুষ দাবি, চাঁদাবাজি ও প্রশাসনিক অনিয়মের প্রমাণ সম্পূর্ণ গোপনীয়তার সাথে জমা দেওয়ার এনক্রিপ্টেড প্ল্যাটফর্ম।",
      badge: "ক্রিপ্টোগ্রাফিক গোপনীয়তা গ্রিড",
      submitDossier: "গোপন তথ্য দাখিল করুন",
      exploreVault: "তথ্য তালিকা ব্রাউজ করুন",
      anonymityBadge: "১০০% পরিচয় সুরক্ষিত",
      amountDemanded: "দাবিকৃত ঘুষের পরিমাণ",
      accusedDept: "বিভাগ / দপ্তর",
      evidenceCount: "সংযুক্ত প্রমাণ",
      statusVerified: "যাচাইকৃত সত্য",
      statusPending: "যাচাই অপেক্ষমান",
      statusInvestigating: "তদন্তাধীন",
      dossierTitle: "হুইসেলব্লোয়ার তথ্য দাখিল",
      dossierDesc: "নথি, অডিও বা লেনদেনের প্রমাণ আপলোড করুন। আপনার আইপি বা পরিচয় সংরক্ষণ করা হয় না।",
      deptLabel: "সরকারি দপ্তর / প্রতিষ্ঠান",
      amountLabel: "দাবিকৃত টাকার পরিমাণ (টাকা)",
      officerNameLabel: "অভিযুক্ত কর্মকর্তা (ঐচ্ছিক)",
      submitClaim: "তথ্য জমা দিন",
      zeroKnowledgeText: "ক্লায়েন্ট-সাইড SHA-256 এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত।",
    },
    lostFound: {
      title: "নাগরিক হারানো ও প্রাপ্তি ভল্ট",
      subtitle: "জাতীয় পরিচয়পত্র, চাবি ও মূল্যবান সামগ্রী নিরাপদে ফিরে পাওয়ার ডিজিটাল উদ্ধার নেটওয়ার্ক।",
      postItem: "নতুন পোস্ট করুন",
      lostTab: "হারানো সামগ্রী",
      foundTab: "প্রাপ্ত সামগ্রী (নিরাপদ হেফাজত)",
      allCategories: "সকল ক্যাটাগরি",
      claimItem: "মালিকানা দাবি করুন",
      verifiedOwner: "সঠিক প্রমাণ প্রদর্শন আবশ্যক",
      reward: "পুরস্কার ঘোষিত",
      formTitle: "হারানো বা প্রাপ্ত সামগ্রীর পোস্ট",
      itemTypeLabel: "পোস্টের ধরন",
      lostRadio: "আমার কিছু হারিয়ে গেছে",
      foundRadio: "আমি কিছু পেয়েছি",
      itemNameLabel: "সামগ্রীর নাম ও মডেল",
      itemDescLabel: "বিবরণ ও সনাক্তকারী চিহ্ন",
      contactInfoLabel: "যোগাযোগ / ওয়ার্ড তথ্য",
      submitPost: "লেজারে প্রকাশ করুন",
    },
    housing: {
      title: "যাচাইকৃত আবাসন ও বাড়িওয়ালা রেটিং",
      subtitle: "স্বচ্ছ ফ্ল্যাট ভাড়া, বাড়িওয়ালার সততা রেটিং ও বাস্তব ভাড়াটিয়া নীতিমালা।",
      listRental: "বাসা ভাড়া তালিকাভুক্ত করুন",
      rentLabel: "মাসিক ভাড়া",
      trustScore: "বাড়িওয়ালার ট্রাস্ট স্কোর",
      verifiedTenant: "যাচাইকৃত ভাড়াটিয়ার রিভিউ",
      bedrooms: "বেডরুম",
      bathrooms: "বাথরুম",
      reviewLandlord: "বাড়িওয়ালা ও ফ্ল্যাট রেটিং দিন",
      formTitle: "বাসা ভাড়ার তালিকা প্রকাশ",
      flatTitleLabel: "ফ্ল্যাটের শিরোনাম",
      rentPriceLabel: "মাসিক ভাড়া (টাকা)",
      addressLabel: "সম্পূর্ণ ঠিকানা ও ওয়ার্ড",
      amenitiesLabel: "সুবিধাসমূহ",
      submitRental: "তালিকা প্রকাশ করুন",
    },
    services: {
      title: "স্থানীয় কারিগর ও জরুরি সেবা ডিরেক্টরি",
      subtitle: "ওয়ার্ডের ব্যাকগ্রাউন্ড যাচাইকৃত ইলেকট্রিশিয়ান, প্লাম্বার ও জরুরি টেকনিশিয়ান।",
      registerTrade: "পেশাদার কারিগর হিসেবে যোগ দিন",
      vettedPros: "যাচাইকৃত পেশাদার",
      rating: "নাগরিক রেটিং",
      emergencyCall: "জরুরি সরাসরি কল",
      bookService: "বুকিং দিন",
      allTrades: "সকল পেশা",
      formTitle: "কারিগর পেশাদার নিবন্ধন",
      tradeTypeLabel: "কাজের ধরন (ইলেকট্রিশিয়ান, প্লাম্বার ইত্যাদি)",
      experienceLabel: "কাজের অভিজ্ঞতা (বছর)",
      contactLabel: "ফোন / হোয়াটসঅ্যাপ নম্বর",
      hourlyRateLabel: "মৌলিক চার্জ (টাকা)",
      submitProfile: "প্রোফাইল সংরক্ষণ করুন",
    },
    parking: {
      title: "মেট্রোপলিটন স্মার্ট পার্কিং হাব",
      subtitle: "রিয়েল-টাইম লিডার সেন্সর ট্র্যাকিং, ডিজিটাল পাস ও স্বয়ংক্রিয় পার্কিং স্পট বুকিং।",
      findParking: "খালি পার্কিং খুঁজুন",
      manageBookings: "আমার পার্কিং পাস",
      manageVehicles: "নিবন্ধিত যানবাহন",
      violations: "জরিমানা ও আপিল",
      availableBays: "খালি স্পট",
      hourlyRate: "ঘণ্টাপ্রতি চার্জ",
      bookBay: "স্পট অগ্রিম বুক করুন",
      activeSensors: "লিডার সেন্সর সক্রিয়",
    },
    auth: {
      loginTitle: "নাগরিক ও কর্মকর্তা পোর্টাল",
      loginSubtitle: "নাগরিক স্বচ্ছতা, দুর্নীতি প্রতিরোধ ও সরকারি সেবায় এক ক্লিকে প্রবেশ করুন।",
      registerTitle: "প্রত্যয়-এ যুক্ত হোন",
      registerSubtitle: "আপনার নাগরিক অধিকার ও সকল সেবায় যুক্ত হতে অ্যাকাউন্ট তৈরি করুন।",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "name@example.com",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "••••••••",
      nameLabel: "পূর্ণ নাম",
      namePlaceholder: "যেমন: খালিদ হাসান",
      phoneLabel: "ফোন নম্বর",
      districtLabel: "জেলা",
      roleLabel: "অ্যাকাউন্টের ধরন",
      citizenRole: "সাধারণ নাগরিক",
      officerRole: "ফিল্ড কর্মকর্তা",
      loginButton: "লগইন করুন",
      registerButton: "অ্যাকাউন্ট তৈরি করুন",
      dontHaveAccount: "অ্যাকাউন্ট নেই?",
      alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      systemOnline: "সিস্টেম নিরাপদ ও সচল",
    },
    common: {
      search: "অনুসন্ধান করুন...",
      filter: "ফিল্টার",
      viewAll: "সব দেখুন",
      openModule: "মডিউলে প্রবেশ",
      submit: "জমা দিন",
      cancel: "বাতিল",
      loading: "লোড হচ্ছে...",
      back: "ফিরে যান",
      save: "সংরক্ষণ করুন",
      delete: "মুছে ফেলুন",
      edit: "সম্পাদনা",
      systemOnline: "সিস্টেম নিরাপদ ও সচল",
      noData: "কোনো তথ্য পাওয়া যায়নি।",
      success: "সফলভাবে সম্পন্ন হয়েছে!",
      error: "একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।",
      viewOnMap: "ম্যাপে দেখুন",
    },
  },
};
