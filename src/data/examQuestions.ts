export interface ExamQuestion {
  id: string;
  question: string;
  context?: string;
  options: {
    key: string;
    text: string;
  }[];
  correctKey: string;
  points: number;
  explanation: string;
}

export const ROUND_1_QUESTIONS: ExamQuestion[] = [
  {
    id: 'R1-Q1',
    question: '1. Based on the Turnstile Reader telemetry, how did the intruder physically enter the facility?',
    context: 'Reader UID: 04:88:41:E7 | Protocol: 37-bit Wiegand | Antenna Flag: 0x04 POLARITY_MISMATCH',
    options: [
      { key: 'A', text: 'Bypassed the glass turnstiles by forcing the lock with a crowbar' },
      { key: 'B', text: 'Swiped a cloned RFID badge (ID #8841 belonging to Elena Vance) flagged with antenna modulation anomalies' },
      { key: 'C', text: 'Used a legitimate temporary visitor pass registered at the reception desk' },
      { key: 'D', text: 'Exploited a firmware buffer overflow on the turnstile access controller' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'Elena Vance’s badge UID was cloned using a Proxmark3/T5577 card, causing an antenna polarity mismatch warning.',
  },
  {
    id: 'R1-Q2',
    question: '2. What physical hardware artifact was discovered plugged into the rear USB port of Workstation 04?',
    context: 'Device ID: USB\\VID_05AC&PID_0220 | Hardware Descriptor: Apple Extended Keyboard II',
    options: [
      { key: 'A', text: 'Standard 32GB USB mass storage thumb drive containing company spreadsheets' },
      { key: 'B', text: 'Malicious Rubber Ducky HID keystroke injector disguised as a keyboard to bypass USB drive blocks' },
      { key: 'C', text: 'Rogue Wi-Fi Pineapple adapter sniffing employee network traffic' },
      { key: 'D', text: 'External SATA hard drive extracting system backups' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The device emulated a generic Apple HID keyboard (VID 0x05AC / PID 0x0220) to inject automated commands at 800+ words/minute.',
  },
  {
    id: 'R1-Q3',
    question: '3. System event logs show the hardware RTC clock was modified. What anti-forensics technique was applied?',
    context: 'Event ID 261: System time altered by -1694 seconds to 20:52:00 from previous 21:20:14',
    options: [
      { key: 'A', text: 'Automatic Daylight Saving Time (DST) domain synchronization adjustment' },
      { key: 'B', text: 'A deliberate clock stomp rolling back the clock by 28 minutes to fabricate an alibi during Marcus Chen’s dinner break' },
      { key: 'C', text: 'Random drift caused by a dying CMOS motherboard battery' },
      { key: 'D', text: 'Network latency spike causing NTP server packet drops' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The intruder used `w32tm` to roll back the system time 28 minutes, attempting to disguise the real time of incursion.',
  },
  {
    id: 'R1-Q4',
    question: '4. According to Windows Security Event ID 4688, which payload process was spawned by the injected keystrokes?',
    context: 'Event ID: 4688 | Parent: explorer.exe | NewProcessName: powershell.exe',
    options: [
      { key: 'A', text: 'cmd.exe /c format C: /y /q' },
      { key: 'B', text: 'powershell.exe -NoP -NonI -W Hidden -Enc SUVY... (Hidden encoded PowerShell execution)' },
      { key: 'C', text: 'notepad.exe C:\\confidential\\passwords.txt' },
      { key: 'D', text: 'calc.exe spawned for testing memory permissions' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The keystrokes executed an encoded hidden PowerShell cradle that established command-and-control communication.',
  },
];

export const ROUND_2_QUESTIONS: ExamQuestion[] = [
  {
    id: 'R2-Q1',
    question: '1. In the CAM 01 surveillance video at 21:08:14, what is the appearance and uniform of the person swiping the badge?',
    context: 'Observation from CAM 01 (North Lobby Entrance Turnstiles)',
    options: [
      { key: 'A', text: 'Female executive wearing a dark corporate blazer and security keycard lanyard' },
      { key: 'B', text: 'Male in navy utility contractor jumpsuit with "Air-Tech" patch, low-brim cap, and diagnostic toolbox' },
      { key: 'C', text: 'Security guard wearing high-visibility yellow uniform and utility belt' },
      { key: 'D', text: 'Delivery courier wearing red casual shirt and helmet' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'Footage clearly reveals an external contractor wearing navy utility clothing with HVAC maintenance tools.',
  },
  {
    id: 'R2-Q2',
    question: '2. Watch the CAM 02 surveillance feed between 21:12:00 and 21:13:00. What caused the camera visibility loss?',
    context: 'Observation from CAM 02 (Server Room Corridor Junction B)',
    options: [
      { key: 'A', text: 'A building electrical outage caused the video signal to go completely black' },
      { key: 'B', text: 'Subject reached up with an extension pole to affix a frosted translucent optic diffuser film over the lens' },
      { key: 'C', text: 'The camera physically fell off its wall mount bracket' },
      { key: 'D', text: 'An infrared laser burned out the CMOS image sensor permanently' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The contractor used an extension pole to affix frosted 3M diffuser tape over Camera 02, creating a 23-minute visual deadzone.',
  },
  {
    id: 'R2-Q3',
    question: '3. In the CAM 03 surveillance feed at 21:24:02, what physical action does the subject take at Workstation 04?',
    context: 'Observation from CAM 03 (Executive Suite Desks)',
    options: [
      { key: 'A', text: 'Unplugs the desktop monitor and carries it away' },
      { key: 'B', text: 'Kneels behind Desk 04, plugs in the USB Rubber Ducky, and types commands on the keyboard' },
      { key: 'C', text: 'Leaves a typed ransom note on Marcus Chen’s chair' },
      { key: 'D', text: 'Photographs Marcus Chen’s family pictures on the desk' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The video captures the subject plugging the keystroke injection tool into the rear port while Desk 04 was unattended.',
  },
  {
    id: 'R2-Q4',
    question: '4. In the video at 21:38:50, what exit route was taken to leave the premises without badging out?',
    context: 'Observation from CAM 01 / Perimeter View',
    options: [
      { key: 'A', text: 'Exited through Fire Exit Door 3B into the rear alleyway and threw gloves into a recycling bin' },
      { key: 'B', text: 'Swiped their badge again at the main front lobby turnstile' },
      { key: 'C', text: 'Climbed out through the executive boardroom window' },
      { key: 'D', text: 'Hid in the janitor supply closet until the next morning' },
    ],
    correctKey: 'A',
    points: 25,
    explanation: 'The intruder bypassed electronic logging by pushing through emergency door 3B directly into the exterior service alley.',
  },
];

export const ROUND_3_QUESTIONS: ExamQuestion[] = [
  {
    id: 'R3-Q1',
    question: '1. Who is the primary perpetrator responsible for the cyber breach?',
    context: 'Deduction based on cross-correlated forensic evidence, CCTV footage, and verified alibis',
    options: [
      { key: 'A', text: 'Marcus Chen (Senior Systems Administrator)' },
      { key: 'B', text: 'Elena Vance (Lead Network Operations Engineer)' },
      { key: 'C', text: 'Dr. Sarah Lin (Chief AI Scientist)' },
      { key: 'D', text: 'Trevor Bailey (External HVAC Facilities Contractor / Air-Tech Vendor)' },
    ],
    correctKey: 'D',
    points: 25,
    explanation: 'Trevor Bailey used his contractor maintenance access to blind cameras, clone Elena Vance’s badge, and deploy the USB payload.',
  },
  {
    id: 'R3-Q2',
    question: '2. What conclusive forensic proof eliminates Marcus Chen despite his workstation being the attack vector?',
    context: 'Suspect alibi and biometric access verification',
    options: [
      { key: 'A', text: 'He was attending an overseas conference in Japan' },
      { key: 'B', text: 'Basement server room biometric fingerprint reader verified him locked at Server Rack 04 from 21:15 to 21:35' },
      { key: 'C', text: 'His workstation had been unpowered the entire weekend' },
      { key: 'D', text: 'He had submitted his resignation two weeks earlier' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'Marcus Chen’s fingerprint verified his physical presence locked inside the basement server vault at the exact time of the workstation attack.',
  },
  {
    id: 'R3-Q3',
    question: '3. What conclusive evidence eliminates Elena Vance despite her badge ID #8841 being used at the front door?',
    context: 'Network perimeter defense & MFA token logs',
    options: [
      { key: 'A', text: 'She had lost her badge in a subway station three months earlier' },
      { key: 'B', text: 'Concurrent FIDO2 hardware key authentication proves she was on VPN from home IP 198.51.100.42 throughout the incident' },
      { key: 'C', text: 'She was hospitalized on the night of the incident' },
      { key: 'D', text: 'Her credentials were suspended by HR earlier that day' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'Elena Vance was actively logged into the corporate VPN from home with a physical FIDO2 key, proving she was not on-site.',
  },
  {
    id: 'R3-Q4',
    question: '4. What was the exact chronological sequence of the attack from inception to exfiltration?',
    context: 'Chronological reconstruction across all three investigation phases',
    options: [
      { key: 'A', text: 'Emergency exit -> USB injection -> Cloned badge swipe -> Camera blinding' },
      { key: 'B', text: 'Cloned badge entry (21:08) -> Camera 02 diffuser tamper (21:12) -> Workstation USB injection & clock skew (21:24) -> Emergency stairwell exit (21:38)' },
      { key: 'C', text: 'Phishing email -> VPN brute-force -> Workstation attack -> Server room entry' },
      { key: 'D', text: 'Camera blinding -> Server theft -> Wall clock sync -> Turnstile departure' },
    ],
    correctKey: 'B',
    points: 25,
    explanation: 'The timeline strictly correlates the 21:08 entry, 21:12 lens tamper, 21:24 keystroke injection, and 21:38 emergency exit.',
  },
];
