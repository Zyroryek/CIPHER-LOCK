import type { EvidenceItem, SuspectProfile, CCTVEvent } from '../types/game.ts';

// Avatars generated via generate_image
export const SUSPECT_AVATARS = {
  marcus_chen: '/src/assets/images/suspect_marcus_chen_1791954733649.jpg',
  elena_vance: '/src/assets/images/suspect_elena_vance_1791954734277.jpg',
  sarah_lin: '/src/assets/images/suspect_sarah_lin_1791954734759.jpg',
  trevor_bailey: '/src/assets/images/suspect_trevor_bailey_1791954736207.jpg',
  cyber_backdrop: '/src/assets/images/cyber_incident_room_1791954735719.jpg',
};

export const MASTER_EVIDENCE_ITEMS: EvidenceItem[] = [
  // LEVEL 1: Isometric Office Inspection Evidence
  {
    id: 'EVD-101',
    title: 'Workstation 04 Security Event Log 4624/4688',
    description: 'Security log reveals an interactive console logon (LogonType 2) at Workstation 04. Spurious PowerShell process spawned hidden terminal with command line referencing a transient drive volume.',
    category: 'digital_forensics',
    originLevel: 1,
    sourceLocation: 'Employee Workstation 04',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'WS-04-DESK (Marcus Chen)',
      hashOrSerial: 'SHA256: 9f8a3c...b281',
      rawLogExcerpt: 'EventID: 4688 | NewProcess: powershell.exe -NoP -NonI -W Hidden -Enc SUVY... | Parent: explorer.exe',
      significance: 'Proof of interactive local execution while terminal owner was logged out.',
    },
  },
  {
    id: 'EVD-102',
    title: 'Rogue USB Keystroke Injector (Rubber Ducky)',
    description: 'Found lodged behind the rear USB 3.0 port of Workstation 04. Emulates a generic HID keyboard (VID: 0x05AC / PID: 0x0220). Firmware extracted contains preprogrammed keystroke injection script.',
    category: 'digital_forensics',
    originLevel: 1,
    sourceLocation: 'Workstation 04 Rear I/O Panel',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Hardware Keystroke Injector',
      hashOrSerial: 'DEV_VID_05AC&PID_0220',
      rawLogExcerpt: 'DELAY 500\nGUI r\nDELAY 200\nSTRING powershell -ep bypass -c "IEX(New-Object Net.WebClient)..."\nENTER',
      significance: 'Physical attack vector bypasses standard USB mass storage restrictions.',
    },
  },
  {
    id: 'EVD-103',
    title: 'RFID Badge Reader Telemetry (Door 01-East)',
    description: 'Door logs indicate Elena Vance (Badge #8841) badged in at 21:08:14. However, the cryptographic reader flagged a slight parity bit anomaly consistent with a Proxmark3 RFID clone.',
    category: 'physical_access',
    originLevel: 1,
    sourceLocation: 'Turnstile Access Reader #01',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'HID iCLASS SE Reader v3.2',
      hashOrSerial: 'CARD_UID_04_88_41_E7',
      rawLogExcerpt: '[21:08:14 UTC] BADGE_AUTH_SUCCESS: ID=8841 (Vance, E.) | RSSI=-42dBm | ANTENNA_POLARITY_ERR=0x04',
      significance: 'Card cloned with low-cost field writer; physical carrier was an impersonator.',
    },
  },
  {
    id: 'EVD-104',
    title: 'NTP Time Skew & Hardware RTC Discrepancy',
    description: 'Workstation 04 local CMOS clock was forcefully adjusted backwards by exactly 28 minutes and 14 seconds via `w32tm` prior to payload staging, fabricating an earlier timeline.',
    category: 'timestamps',
    originLevel: 1,
    sourceLocation: 'Time Synchronization Audit Log',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Domain Time Service / CMOS RTC',
      hashOrSerial: 'NTP_DELTA_SEC: -1694',
      rawLogExcerpt: '[Event 261] The system time has changed by -1694 seconds to 20:52:00 from previous 21:20:14.',
      significance: 'Deliberate anti-forensic time stomping to establish a false alibi.',
    },
  },
  {
    id: 'EVD-105',
    title: 'Corridor Junction B CCTV Blind Spot Assessment',
    description: 'Floor inspection in Corridor B reveals heavy composite work-boot scuff marks leading directly into the deadzone of Camera 02. Overhead HVAC duct access hatch was unlatched.',
    category: 'physical_access',
    originLevel: 1,
    sourceLocation: 'Corridor Junction B Ceiling & Floor',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Physical Infrastructure / Facility Zone B',
      hashOrSerial: 'MAINT_HATCH_B12',
      rawLogExcerpt: 'Physical report: HVAC damper filter opened. Camera 02 lens covered with static diffuser film at 21:12.',
      significance: 'Route required contractor-level physical knowledge of facility ducts and blind angles.',
    },
  },

  // LEVEL 2: CCTV Surveillance Evidence
  {
    id: 'EVD-201',
    title: 'CCTV Frame 21:08:14 — Main Lobby Turnstile',
    description: 'A figure wearing a navy utility contractor jacket and carrying an HVAC diagnostic toolbox swipes cloned Badge #8841. Facial angle deliberately obscured by low-brim cap.',
    category: 'cctv_observations',
    originLevel: 2,
    sourceLocation: 'CAM_01 Main Entrance',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Axis P3245-V Network Camera',
      hashOrSerial: 'CAM01_FRAME_210814',
      rawLogExcerpt: 'Subject: Male, approx 180cm, navy workwear, HVAC Facilities badge holster, toolbox in right hand.',
      significance: 'Confirms physical carrier of cloned badge was NOT Elena Vance.',
    },
  },
  {
    id: 'EVD-202',
    title: 'CCTV Frame 21:12:30 — Server Corridor Tamper',
    description: 'Camera 02 feed experiences localized optical fogging. Subject reaches upwards with a pole to affix a frosted translucent film over lens housing, creating 23 minutes of visibility loss.',
    category: 'cctv_observations',
    originLevel: 2,
    sourceLocation: 'CAM_02 Server Room Corridor',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Hikvision DarkFighter DS-2CD',
      hashOrSerial: 'CAM02_OPTICAL_ANOMALY',
      rawLogExcerpt: 'Luminance drop: 84% | Motion trigger in Sector 4: Navy sleeve with patch "AIR-TECH CLIMATE SOLUTIONS".',
      significance: 'Links the physical obstruction directly to contractor uniform patch.',
    },
  },
  {
    id: 'EVD-203',
    title: 'CCTV Frame 21:24:02 — Workstation 04 I/O Access',
    description: 'Subject kneels behind Marcus Chen’s desk, inserts USB dongle into rear port, types on keyboard for 42 seconds, and retrieves a secondary hardware key before exiting.',
    category: 'cctv_observations',
    originLevel: 2,
    sourceLocation: 'CAM_03 Executive Suite',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Hanwha Techwin Dome 4K',
      hashOrSerial: 'CAM03_CAPTURE_WS04',
      rawLogExcerpt: 'Object interaction detected at Desk 04. Rapid keystroke cadence matching automated HID execution.',
      significance: 'Matches the exact timestamp of USB Rubber Ducky connection.',
    },
  },
  {
    id: 'EVD-204',
    title: 'CCTV Frame 21:38:50 — Emergency Stairwell Exit',
    description: 'Subject flees through Fire Exit Door 3B into the service alleyway, discarding disposable latex gloves into an exterior recycling bin.',
    category: 'cctv_observations',
    originLevel: 2,
    sourceLocation: 'CAM_01 Perimeter View',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Axis Exterior PTZ',
      hashOrSerial: 'CAM01_EXTERIOR_EXIT',
      rawLogExcerpt: 'Emergency door contact switch opened without badge reader swipe. Vehicle tail lights detected leaving alley.',
      significance: 'Confirms exit vector bypassed electronic turnstile logging.',
    },
  },

  // LEVEL 3: Cross-Correlated Suspect & Cryptographic Evidence
  {
    id: 'EVD-301',
    title: 'Elena Vance Concurrent Remote 2FA Audit',
    description: 'Radius VPN logs prove Elena Vance was authenticated from home IP 198.51.100.42 with FIDO2 hardware key from 19:30 to 23:45, making physical presence at 21:08 impossible.',
    category: 'verified_findings',
    originLevel: 3,
    sourceLocation: 'Okta / Cisco AnyConnect Telemetry',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Corporate MFA Gateway',
      hashOrSerial: 'FIDO2_SESSION_0x99A',
      rawLogExcerpt: 'Active TCP session: 198.51.100.42 -> 10.0.1.1 (ESTABLISHED 19:30:11 to 23:45:00 UTC) | 2FA Push Verified.',
      significance: 'Definitively exonerates Elena Vance.',
    },
  },
  {
    id: 'EVD-302',
    title: 'Marcus Chen Server Rack 04 Console Authentication',
    description: 'Biometric fingerprint reader on Server Rack 04 in the basement data room recorded Marcus Chen checking RAID array parity continuously between 21:15 and 21:35.',
    category: 'verified_findings',
    originLevel: 3,
    sourceLocation: 'Data Center Biometric Terminal',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Suprema BioStation 3',
      hashOrSerial: 'FP_MATCH_CHEN_M',
      rawLogExcerpt: '[21:15:02] BIO_FINGERPRINT_VERIFIED: Marcus Chen | RACK_CONSOLE_LOCKED: 21:35:10',
      significance: 'Proves Marcus Chen could not have been physically sitting at Workstation 04 at 21:24.',
    },
  },
  {
    id: 'EVD-303',
    title: 'Contractor Work Order #TC-889 & Air-Tech Van Inventory',
    description: 'Work order signed by Trevor Bailey for air handler duct maintenance. Inspection of his van revealed Proxmark3 RFID cloner, blank T5577 rewritable cards, and Rubber Ducky payload scripts.',
    category: 'suspect_information',
    originLevel: 3,
    sourceLocation: 'Facilities Security Locker / Vehicle Search',
    isVerified: true,
    technicalMetadata: {
      targetSystem: 'Facilities Work Order / Hardware Seizure',
      hashOrSerial: 'PROXMARK3_SERIAL_PM3RDV4',
      rawLogExcerpt: 'Seized items: Proxmark3 RDV4, 3x blank cards, USB Rubber Ducky, printout of Workstation 04 IP address.',
      significance: 'Conclusive evidence linking the physical equipment to Trevor Bailey.',
    },
  },
];

export const SUSPECT_DOSSIERS: SuspectProfile[] = [
  {
    id: 'suspect_marcus_chen',
    name: 'Marcus Chen',
    role: 'Senior Systems Administrator',
    department: 'Infrastructure & Cloud Systems',
    badgeId: 'BADGE-#4192',
    avatarUrl: SUSPECT_AVATARS.marcus_chen,
    backgroundDossier: 'Responsible for domain administration, Active Directory root certificates, and server room operations. Has root credentials on all workstations. Under stress due to upcoming quantum audit.',
    alibi: 'Claims he was inside the secure basement data center inspecting a failing drive array in Server Rack 04 during the incident window.',
    accessCardLogs: [
      { timestamp: '20:45:00', location: 'Floor 2 Entry Turnstile', event: 'Badge In' },
      { timestamp: '21:14:50', location: 'Basement Server Room', event: 'Biometric + Badge Swipe' },
      { timestamp: '21:36:00', location: 'Basement Server Room', event: 'Badge Out' },
    ],
    workstationLogs: [
      { timestamp: '21:20:14', action: 'Interactive Logon / Time Skew Initiated', terminal: 'WS-04-DESK' },
      { timestamp: '21:24:02', action: 'PowerShell Payload Execution', terminal: 'WS-04-DESK' },
    ],
    cctvSightings: [
      { timestamp: '21:14:40', camera: 'CAM_02 Server Room Corridor', note: 'Marcus Chen swiping into basement data center carrying hard drive caddy.' },
    ],
    contradictions: 'His personal terminal (WS-04) was the attack vector, but biometric logs confirm he was locked in the basement data room.',
    isPerpetrator: false,
  },
  {
    id: 'suspect_elena_vance',
    name: 'Elena Vance',
    role: 'Lead Network Operations Engineer',
    department: 'Core NetOps & Perimeter Defense',
    badgeId: 'BADGE-#8841',
    avatarUrl: SUSPECT_AVATARS.elena_vance,
    backgroundDossier: 'Manages firewalls, IDS/IPS sensors, and network micro-segmentation. Was scheduled on-call during the shift.',
    alibi: 'Was working from home 12 miles away in North Bethesda. Connects through the corporate VPN gateway.',
    accessCardLogs: [
      { timestamp: '21:08:14', location: 'Turnstile Access Reader #01', event: 'Badge In (Flagged: Reader Parity Anomaly)' },
    ],
    workstationLogs: [
      { timestamp: '19:30:00 to 23:45:00', action: 'Remote VPN SSH to Core Gateway', terminal: 'VPN-GATEWAY-01' },
    ],
    cctvSightings: [
      { timestamp: '21:08:14', camera: 'CAM_01 Main Entrance', note: 'Figure swiped Vance’s badge, but wore navy utility clothes and was male.' },
    ],
    contradictions: 'Her badge opened the door, but concurrent VPN logs and CCTV show someone else swiped a cloned version.',
    isPerpetrator: false,
  },
  {
    id: 'suspect_sarah_lin',
    name: 'Dr. Sarah Lin',
    role: 'Chief AI Research Scientist',
    department: 'Quantum Neural Systems',
    badgeId: 'BADGE-#1007',
    avatarUrl: SUSPECT_AVATARS.sarah_lin,
    backgroundDossier: 'Principal architect of the quantum neural model that was targeted for exfiltration. Has top-tier IP access.',
    alibi: 'Was in the sealed Level 4 Cleanroom conducting vacuum calibration from 20:00 through midnight.',
    accessCardLogs: [
      { timestamp: '19:55:00', location: 'Level 4 Cleanroom Airlock', event: 'Retinal + Badge Access' },
      { timestamp: '00:15:00', location: 'Level 4 Cleanroom Airlock', event: 'Retinal + Badge Exit' },
    ],
    workstationLogs: [
      { timestamp: '20:10:00', action: 'Local Quantum Jupyter Kernel Session', terminal: 'CLEANROOM-NODE-A' },
    ],
    cctvSightings: [
      { timestamp: '20:00:00 to 23:00:00', camera: 'CAM_CLEANROOM_INTERNAL', note: 'Visible at lab bench throughout incident.' },
    ],
    contradictions: 'Has access to the intellectual property, but physically sealed inside the Level 4 lab with no physical or digital egress.',
    isPerpetrator: false,
  },
  {
    id: 'suspect_trevor_bailey',
    name: 'Trevor Bailey',
    role: 'External HVAC Facilities Contractor',
    department: 'Air-Tech Climate Solutions (Vendor)',
    badgeId: 'BADGE-#0485B',
    avatarUrl: SUSPECT_AVATARS.trevor_bailey,
    backgroundDossier: 'Contracted for quarterly maintenance of HVAC ceiling dampers and server room environmental cooling. Had blueprint access to blind spots and crawl spaces. Substantial unexplained offshore deposits.',
    alibi: 'Claims he was in the boiler room on Sub-Level 2 repairing a coolant valve from 21:00 to 22:00.',
    accessCardLogs: [
      { timestamp: '18:30:00', location: 'Vendor Loading Bay Turnstile', event: 'Contractor Badge In' },
      { timestamp: '21:08:14', location: 'Main Entrance Turnstile', event: '[Used Cloned Badge #8841]' },
    ],
    workstationLogs: [
      { timestamp: 'None authorized', action: 'Unauthorized access to Workstation 04', terminal: 'WS-04-DESK' },
    ],
    cctvSightings: [
      { timestamp: '21:08:14', camera: 'CAM_01 Main Entrance', note: 'Wearing navy utility gear, carrying toolbox with hidden electronics.' },
      { timestamp: '21:12:30', camera: 'CAM_02 Server Corridor', note: 'Affixing diffuser film over camera lens.' },
      { timestamp: '21:24:02', camera: 'CAM_03 Executive Suite', note: 'Kneeling behind Workstation 04 inserting USB device.' },
      { timestamp: '21:38:50', camera: 'CAM_01 Perimeter View', note: 'Exiting via Emergency Stairwell into alleyway.' },
    ],
    contradictions: 'Claimed to be in boiler room, but CCTV footage, tool boot treads, seized RFID cloner, and Rubber Ducky prove he infiltrated the office.',
    isPerpetrator: true,
  },
];

export const CCTV_TIMELINE_EVENTS: CCTVEvent[] = [
  {
    id: 'CCTV-EV-01',
    cameraId: 'CAM_01',
    cameraName: 'CAM 01: Main Entrance & Turnstiles',
    timestampSeconds: 494, // 21:08:14 (08m 14s into window)
    displayTimestamp: '21:08:14',
    title: 'Suspicious Contractor Turnstile Entry',
    description: 'Subject in navy workwear and cap badges through with cloned card. RFID reader LED flashes orange warning bit.',
    evidenceId: 'EVD-201',
    visualOverlay: {
      boundingBox: { x: 42, y: 35, w: 22, h: 48 },
      label: 'SUBJECT #4: NAVY UTILITY WEAR',
      motionLevel: 'medium',
      highlightColor: '#06b6d4',
    },
    anomalyDetected: true,
  },
  {
    id: 'CCTV-EV-02',
    cameraId: 'CAM_02',
    cameraName: 'CAM 02: Server Room Corridor',
    timestampSeconds: 750, // 21:12:30
    displayTimestamp: '21:12:30',
    title: 'Camera 02 Optical Obstruction',
    description: 'Subject uses an extension rod to place frosted film over lens housing. Camera feed degrades into blurred shadows.',
    evidenceId: 'EVD-202',
    visualOverlay: {
      boundingBox: { x: 20, y: 10, w: 60, h: 30 },
      label: 'TAMPER: OPTICAL DIFFUSER ATTACHED',
      motionLevel: 'high',
      highlightColor: '#f43f5e',
    },
    anomalyDetected: true,
  },
  {
    id: 'CCTV-EV-03',
    cameraId: 'CAM_02',
    cameraName: 'CAM 02: Server Room Corridor',
    timestampSeconds: 880, // 21:14:40
    displayTimestamp: '21:14:40',
    title: 'Marcus Chen Enters Basement Server Room',
    description: 'Marcus Chen badges into the server room door carrying replacement SAS disk drives. He is in full view of Camera 02 lower frame.',
    evidenceId: 'EVD-302',
    visualOverlay: {
      boundingBox: { x: 70, y: 40, w: 18, h: 42 },
      label: 'MARCUS CHEN (AUTHENTICATED)',
      motionLevel: 'low',
      highlightColor: '#10b981',
    },
    anomalyDetected: false,
  },
  {
    id: 'CCTV-EV-04',
    cameraId: 'CAM_03',
    cameraName: 'CAM 03: Executive Office & Workstations',
    timestampSeconds: 1442, // 21:24:02
    displayTimestamp: '21:24:02',
    title: 'Workstation 04 Keystroke Injection',
    description: 'Contractor seen reaching behind Workstation 04. Terminal monitor lights up with command prompt execution.',
    evidenceId: 'EVD-203',
    visualOverlay: {
      boundingBox: { x: 38, y: 28, w: 26, h: 54 },
      label: 'PHYSICAL COMPROMISE: DESK 04',
      motionLevel: 'medium',
      highlightColor: '#f59e0b',
    },
    anomalyDetected: true,
  },
  {
    id: 'CCTV-EV-05',
    cameraId: 'CAM_01',
    cameraName: 'CAM 01: Main Entrance & Turnstiles',
    timestampSeconds: 2330, // 21:38:50
    displayTimestamp: '21:38:50',
    title: 'Emergency Stairwell Exfiltration',
    description: 'Contractor exits via Fire Exit 3B into external alley without turnstile swipe. Discards gloves into bin.',
    evidenceId: 'EVD-204',
    visualOverlay: {
      boundingBox: { x: 65, y: 30, w: 20, h: 45 },
      label: 'UNAUTHORIZED EXIT: DOOR 3B',
      motionLevel: 'high',
      highlightColor: '#f43f5e',
    },
    anomalyDetected: true,
  },
];

// PROTECTED VALIDATION LOGIC
export const VALIDATION_RULES = {
  level1: {
    correctEntryVector: 'physical_incursion_usb_hid',
    requiredEvidence: ['EVD-102', 'EVD-103', 'EVD-104'],
    clockDiscrepancyAnswer: 'rtc_skew_manipulation',
  },
  level2: {
    correctSuspect: 'suspect_trevor_bailey',
    primeEventId: 'CCTV-EV-04',
    requiredEventsInOrder: ['CCTV-EV-01', 'CCTV-EV-02', 'CCTV-EV-04', 'CCTV-EV-05'],
    unlockedCredentialText: 'CERT-TOKEN::TREVOR-FACILITIES-SEIZED-0485B::PASSED',
  },
  level3: {
    correctAttacker: 'suspect_trevor_bailey',
    correctEntryMethod: 'cloned_rfid_plus_rubber_ducky',
    requiredChronology: [
      '21:08 - Cloned badge entry at East Turnstile',
      '21:12 - Camera 02 lens diffuser obstruction',
      '21:20 - Workstation 04 USB Rubber Ducky insertion & clock skew',
      '21:38 - Emergency stairwell exit without badging',
    ],
    eliminatedSuspects: ['suspect_marcus_chen', 'suspect_elena_vance', 'suspect_sarah_lin'],
  },
};
