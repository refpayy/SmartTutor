import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, StatusBar, Animated, Vibration,
  Alert, Dimensions, Modal, Switch
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── SUPABASE CONFIG ──────────────────────────────────────
const SUPABASE_URL = 'https://dpmepvmweilbcsjeewud.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kTyolSnESUyxGi3bqYmHWg_zkUiRdVF';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { width: SW } = Dimensions.get('window');

// ─── COLORS ───────────────────────────────────────────────
const C = {
  bg:'#07080F', surface:'#0E1019', card:'#13151F', card2:'#1A1D2E',
  border:'#252838',
  mint:'#00FF88', cyan:'#00D4FF', purple:'#7C3AED',
  gold:'#FFD060', red:'#FF4560', orange:'#FF7A00', blue:'#3B82F6',
  white:'#FFFFFF', gray1:'#E2E8F0', gray2:'#94A3B8', gray3:'#475569', gray4:'#1E2435',
  jazz:'#00A86B', easy:'#F97316',
};

// ─── CONSTANTS ────────────────────────────────────────────
const ADMIN_PHONE = '03331942804';
const ADMIN_PASS  = '9Xflix.com.pk786#123';
const APP_VERSION = '2.0.0';
const COMPANY     = 'SmartTutor Pakistan';
const SUPPORT     = '03331942804';

// Pakistan Tax Rates
const TAX = {
  WHT_TEACHER: 0.05,    // 5% Withholding Tax on teacher earnings
  PLATFORM_FEE: 0.10,   // 10% SmartTutor commission
  JAZZCASH_FEE: 0.015,  // 1.5% JazzCash processing
  EASYPAISA_FEE: 0.015, // 1.5% EasyPaisa processing
  BANK_FEE: 0.0,        // Bank transfer free
  CARD_FEE: 0.025,      // 2.5% Card processing
};

const SUBJECTS = [
  'Quran / Tajweed','Mathematics','Physics','Chemistry','Biology',
  'English','Urdu','Computer Science','Coding / IT','Islamiyat',
  'Pakistan Studies','Economics','Accounting','History','Geography',
];
const LEVELS = ['Primary (1–5)','Middle (6–8)','Matric (9–10)','Intermediate','Bachelors','Masters / PhD','All Ages'];
const PRICING_TYPES = ['Per Day','Per Weekend','Per Month'];
const PAYMENT_METHODS = [
  {id:'jazzcash', icon:'💚', name:'JazzCash', color:'#00A86B', fee: TAX.JAZZCASH_FEE},
  {id:'easypaisa', icon:'🟠', name:'EasyPaisa', color:'#F97316', fee: TAX.EASYPAISA_FEE},
  {id:'bank', icon:'🏦', name:'Bank Transfer', color:C.cyan, fee: TAX.BANK_FEE},
  {id:'card', icon:'💳', name:'Debit / Credit Card', color:C.purple, fee: TAX.CARD_FEE},
];

const CATS = ['All','Quran','Mathematics','Physics','Chemistry','English','Coding'];

const TEACHERS_DATA = [
  {id:1,name:'Ahmad Ali',degree:'MSc Mathematics',uni:'University of Punjab',subject:'Mathematics',level:'Matric (9–10)',pricingType:'Per Month',fee:700,rating:4.8,students:65,timing:'Mon–Thu 6–7 PM',available:true,status:'approved',reviews:42,experience:'5 Saal',verified:true},
  {id:2,name:'Dr. Fatima Malik',degree:'PhD Physics',uni:'Quaid-e-Azam University',subject:'Physics',level:'Intermediate',pricingType:'Per Month',fee:900,rating:4.9,students:45,timing:'Mon–Thu 7–8 PM',available:true,status:'approved',reviews:38,experience:'8 Saal',verified:true},
  {id:3,name:'Qari Imran Siddiqui',degree:'Hafiz-e-Quran',uni:'Jamia Darul Uloom',subject:'Quran / Tajweed',level:'All Ages',pricingType:'Per Month',fee:300,rating:5.0,students:90,timing:'Mon–Fri 6–8 AM',available:true,status:'approved',reviews:67,experience:'12 Saal',verified:true},
  {id:4,name:'Sara Khan',degree:'MA English Literature',uni:'University of Karachi',subject:'English',level:'Class 6–Inter',pricingType:'Per Weekend',fee:250,rating:4.7,students:55,timing:'Sat–Sun 5–6 PM',available:true,status:'approved',reviews:31,experience:'6 Saal',verified:true},
  {id:5,name:'Bilal Ahmed',degree:'MSc Mathematics',uni:'LUMS',subject:'Mathematics',level:'Matric',pricingType:'Per Month',fee:650,rating:0,students:0,timing:'Mon–Thu 7–8 PM',available:false,status:'pending',reviews:0,experience:'3 Saal',verified:false},
  {id:6,name:'Ayesha Raza',degree:'BS Computer Science',uni:'FAST NUCES',subject:'Coding / IT',level:'All Levels',pricingType:'Per Day',fee:150,rating:4.6,students:72,timing:'Mon–Thu 7–8 PM',available:true,status:'approved',reviews:44,experience:'4 Saal',verified:true},
];

const haptic = (p=[50]) => Vibration.vibrate(p);

// ─── UTILITY: TAX CALCULATOR ──────────────────────────────
function calcPayment(amount, method) {
  const m = PAYMENT_METHODS.find(x => x.id === method) || PAYMENT_METHODS[0];
  const platformFee = Math.round(amount * TAX.PLATFORM_FEE);
  const processingFee = Math.round(amount * m.fee);
  const teacherGross = amount - platformFee;
  const wht = Math.round(teacherGross * TAX.WHT_TEACHER);
  const teacherNet = teacherGross - wht - processingFee;
  return { platformFee, processingFee, wht, teacherNet, total: amount };
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────
function NCard({style, children, glow=C.mint}) {
  return (
    <View style={[{backgroundColor:C.card,borderRadius:20,borderWidth:1,borderColor:glow+'35',
      shadowColor:glow,shadowOffset:{width:0,height:0},shadowOpacity:0.15,shadowRadius:8,elevation:4}, style]}>
      {children}
    </View>
  );
}

function Badge({label, color=C.mint, small=false}) {
  return (
    <View style={{backgroundColor:color+'22',paddingHorizontal:small?8:10,paddingVertical:small?3:4,
      borderRadius:20,borderWidth:1,borderColor:color+'55'}}>
      <Text style={{color,fontSize:small?10:11,fontWeight:'800',letterSpacing:0.4}}>{label}</Text>
    </View>
  );
}

function PBtn({label, onPress, color=C.mint, textColor=C.bg, style, disabled=false, size='md'}) {
  const sc = useRef(new Animated.Value(1)).current;
  const press = () => {
    haptic([30]);
    Animated.sequence([
      Animated.timing(sc,{toValue:0.95,duration:60,useNativeDriver:true}),
      Animated.timing(sc,{toValue:1,duration:60,useNativeDriver:true}),
    ]).start(() => onPress && onPress());
  };
  const py = size==='sm' ? 10 : size==='lg' ? 20 : 16;
  return (
    <Animated.View style={[{transform:[{scale:sc}]}, style]}>
      <TouchableOpacity activeOpacity={0.9} onPress={disabled ? undefined : press}
        style={{backgroundColor:disabled?C.gray3:color,paddingVertical:py,borderRadius:16,
          alignItems:'center',shadowColor:disabled?'transparent':color,
          shadowOffset:{width:0,height:3},shadowOpacity:0.3,shadowRadius:10}}>
        <Text style={{color:disabled?C.gray2:textColor,fontSize:size==='sm'?13:16,fontWeight:'900'}}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function GBtn({label, onPress, color=C.cyan, style, size='md'}) {
  return (
    <TouchableOpacity onPress={() => { haptic([30]); onPress && onPress(); }}
      style={[{borderWidth:1.5,borderColor:color,paddingVertical:size==='sm'?10:14,
        borderRadius:16,alignItems:'center'}, style]}>
      <Text style={{color,fontSize:size==='sm'?13:15,fontWeight:'800'}}>{label}</Text>
    </TouchableOpacity>
  );
}

// FIXED Input — no keyboard dismiss bug
function Input({label, style, value, onChangeText, ...props}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{marginBottom:14}, style]}>
      {label && <Text style={{color:C.gray1,fontSize:12,fontWeight:'700',marginBottom:7,letterSpacing:0.8,textTransform:'uppercase'}}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.gray3}
        value={value}
        onChangeText={onChangeText}
        style={{backgroundColor:C.card2,borderWidth:1.5,borderColor:focused?C.mint:C.border,
          borderRadius:14,paddingHorizontal:18,paddingVertical:15,color:C.white,fontSize:15}}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

function SLabel({children, color=C.white, style}) {
  return (
    <View style={[{flexDirection:'row',alignItems:'center',marginTop:22,marginBottom:12,gap:10}, style]}>
      <View style={{width:3,height:17,backgroundColor:C.mint,borderRadius:2}}/>
      <Text style={{color,fontSize:15,fontWeight:'900',letterSpacing:0.3}}>{children}</Text>
    </View>
  );
}

function TopBar({title, onBack, right, subtitle}) {
  return (
    <View style={{backgroundColor:C.surface,borderBottomWidth:1,borderBottomColor:C.border}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
        paddingHorizontal:16,paddingVertical:14}}>
        <TouchableOpacity onPress={() => { haptic([30]); onBack && onBack(); }}
          style={{width:40,height:40,borderRadius:12,backgroundColor:C.card,alignItems:'center',justifyContent:'center'}}>
          {onBack && <Text style={{color:C.mint,fontSize:20,lineHeight:22}}>←</Text>}
        </TouchableOpacity>
        <View style={{flex:1,alignItems:'center'}}>
          <Text style={{color:C.white,fontSize:16,fontWeight:'900',letterSpacing:0.3}}>{title}</Text>
          {subtitle && <Text style={{color:C.gray2,fontSize:11,marginTop:2}}>{subtitle}</Text>}
        </View>
        <View style={{width:40,alignItems:'flex-end'}}>{right || <View/>}</View>
      </View>
    </View>
  );
}

function Stars({rating, size=14}) {
  return (
    <View style={{flexDirection:'row',gap:2}}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{fontSize:size,color:i<=Math.round(rating)?C.gold:'#333'}}>
          {i<=Math.round(rating)?'★':'☆'}
        </Text>
      ))}
    </View>
  );
}

// Professional ST Logo
function STLogo({size=44}) {
  return (
    <View style={{width:size,height:size,borderRadius:size*0.28,overflow:'hidden',position:'relative',
      shadowColor:C.mint,shadowOffset:{width:0,height:0},shadowOpacity:0.8,shadowRadius:size*0.3}}>
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:C.mint}}/>
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,
        backgroundColor:'transparent',borderRadius:size*0.28,
        borderTopWidth:size*0.08,borderTopColor:'#00CC6E',
        borderLeftWidth:size*0.08,borderLeftColor:'#00CC6E',
        borderRightWidth:0,borderBottomWidth:0}}/>
      <View style={{position:'absolute',bottom:0,right:0,
        width:size*0.5,height:size*0.5,backgroundColor:'#00E87A',borderTopLeftRadius:size*0.2}}/>
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,
        alignItems:'center',justifyContent:'center'}}>
        <Text style={{color:C.bg,fontSize:size*0.38,fontWeight:'900',letterSpacing:1}}>ST</Text>
      </View>
    </View>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const show = (msg, color=C.mint) => {
    setToast({msg,color});
    Animated.sequence([
      Animated.timing(anim,{toValue:1,duration:250,useNativeDriver:true}),
      Animated.delay(2200),
      Animated.timing(anim,{toValue:0,duration:250,useNativeDriver:true}),
    ]).start(() => setToast(null));
  };
  const Toast = toast ? (
    <Animated.View style={{position:'absolute',bottom:90,left:20,right:20,backgroundColor:toast.color,
      paddingHorizontal:20,paddingVertical:14,borderRadius:16,opacity:anim,zIndex:999,
      flexDirection:'row',alignItems:'center',shadowColor:toast.color,
      shadowOffset:{width:0,height:4},shadowOpacity:0.4,shadowRadius:12}}>
      <Text style={{color:C.bg,fontWeight:'900',fontSize:14,flex:1}}>{toast.msg}</Text>
    </Animated.View>
  ) : null;
  return {show, Toast};
}

function BottomNav({active, onTab, role='student'}) {
  const tabs = role==='student'
    ? [{id:'home',icon:'🏠',label:'Home'},{id:'search',icon:'🔍',label:'Search'},
       {id:'classes',icon:'📚',label:'Classes'},{id:'profile',icon:'👤',label:'Profile'}]
    : [{id:'home',icon:'🏠',label:'Home'},{id:'classes',icon:'📅',label:'Classes'},
       {id:'earnings',icon:'💰',label:'Earnings'},{id:'profile',icon:'👤',label:'Profile'}];
  return (
    <View style={{flexDirection:'row',backgroundColor:C.surface,borderTopWidth:1,
      borderTopColor:C.border,paddingBottom:8,paddingTop:8}}>
      {tabs.map(t => (
        <TouchableOpacity key={t.id} onPress={() => { haptic([25]); onTab(t.id); }}
          style={{flex:1,alignItems:'center',paddingVertical:6}}>
          <Text style={{fontSize:20}}>{t.icon}</Text>
          <Text style={{color:active===t.id?C.mint:C.gray3,fontSize:10,marginTop:3,
            fontWeight:active===t.id?'800':'500'}}>{t.label}</Text>
          {active===t.id && <View style={{width:20,height:3,backgroundColor:C.mint,borderRadius:2,marginTop:3}}/>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── LEGAL DOCUMENTS ──────────────────────────────────────
const LEGAL = {
  studentAgreement: {
    en: `STUDENT USER AGREEMENT
SmartTutor Pakistan — Version 2.0

Last Updated: 2025

1. ACCEPTANCE OF TERMS
By registering on SmartTutor, you ("Student") agree to be legally bound by this Agreement. If you are under 18, your parent or guardian must consent.

2. ELIGIBILITY
• Any age is permitted. Students under 18 require parental consent.
• You must provide accurate personal information.
• One account per person only.

3. PLATFORM USE
• SmartTutor is an online education platform connecting students with verified teachers.
• You may not share, sell, or transfer your account.
• You must not record, screenshot, or distribute class content without written permission.

4. FEES & PAYMENTS
• Fees are charged per Day, per Weekend, or per Month as set by each teacher.
• All payments are processed securely via JazzCash, EasyPaisa, Bank Transfer, or Card.
• Applicable taxes and processing fees are disclosed at checkout.

5. REFUND POLICY
• Full refund if teacher cancels 2+ consecutive classes without notice.
• No refund for classes attended, even partially.
• Refund requests must be made within 7 days via support.

6. CODE OF CONDUCT
• No sharing of personal contact info (phone, WhatsApp, email) in chat.
• No abusive, harassing, or inappropriate language.
• Violations result in immediate account suspension without refund.

7. PRIVACY
• Your personal data is protected per our Privacy Policy.
• We never sell your data to third parties.
• Chat is monitored by AI for safety purposes.

8. LIMITATION OF LIABILITY
SmartTutor is not liable for internet outages, device failures, or teacher availability beyond our control.

9. GOVERNING LAW
This agreement is governed by the laws of the Islamic Republic of Pakistan.

10. CONTACT
Support: ${SUPPORT} | platform@smarttutor.pk`,

    ur: `طالب علم معاہدہ
سمارٹ ٹیوٹر پاکستان — ورژن 2.0

1. شرائط کی منظوری
سمارٹ ٹیوٹر پر رجسٹریشن کر کے آپ اس معاہدے کے پابند ہیں۔ 18 سال سے کم عمر طلبا کے لیے والدین کی منظوری ضروری ہے۔

2. اہلیت
• ہر عمر کے طلبا خوش آمدید۔ 18 سال سے کم کے لیے والدین کی رضامندی لازمی۔
• آپ کو درست ذاتی معلومات فراہم کرنا ہوں گی۔

3. فیس اور ادائیگی
• فیس یومیہ، ہفتہ آخر، یا ماہانہ بنیاد پر ہوگی۔
• ٹیکس اور پروسیسنگ چارجز چیک آؤٹ پر ظاہر ہوں گے۔

4. واپسی پالیسی
• استاد کی 2+ کلاسیں منسوخ ہوں تو مکمل رقم واپس۔
• حاضر شدہ کلاسز پر کوئی واپسی نہیں۔

5. ضابطہ اخلاق
• چیٹ میں ذاتی رابطہ معلومات شیئر کرنا سختی سے منع ہے۔
• خلاف ورزی پر فوری اکاؤنٹ معطل۔

6. قانون
یہ معاہدہ پاکستان کے قوانین کے تحت ہے۔`,
  },

  teacherAgreement: {
    en: `TEACHER SERVICE AGREEMENT
SmartTutor Pakistan — Version 2.0

Last Updated: 2025

1. PARTIES
This agreement is between SmartTutor Pakistan ("Platform") and you ("Teacher").

2. ELIGIBILITY & VERIFICATION
• Minimum qualification: Matriculation (Class 10 pass).
• Degree certificate and CNIC must be submitted for verification.
• A one-time degree verification fee of Rs. 500 applies.
• SmartTutor reserves the right to approve or reject any application.

3. SUBSCRIPTION
• First 3 months: FREE trial.
• From Month 4 onwards: $2 USD per month (annual plan).
• Annual degree re-verification fee: $2 USD/year.
• Subscription is non-refundable once activated.

4. PRICING
• Teachers set their own fees per Day, per Weekend, or per Month.
• SmartTutor charges a 10% platform commission on all student payments.
• 5% Withholding Tax (WHT) is deducted as per FBR regulations.
• Payment processing fees apply per method used.

5. EARNINGS & WITHDRAWALS
• Net earnings = Student Fee − 10% Commission − 5% WHT − Processing Fee.
• Withdrawals available via JazzCash, EasyPaisa, or Bank Transfer.
• Minimum withdrawal: Rs. 1,000.
• Withdrawals processed within 3–5 business days after admin approval.

6. CLASS OBLIGATIONS
• Teachers must conduct classes as per their listed schedule.
• Maximum 2 cancellations per month permitted. Third cancellation = warning.
• Consistent no-shows result in permanent account removal.
• Timetable changes require admin approval 48 hours in advance.

7. CODE OF CONDUCT
• Teachers must NEVER share or request personal contact info outside the platform.
• No political, religious debates, or inappropriate content.
• Classes must be conducted professionally in a quiet environment.
• Student privacy must be fully respected at all times.

8. INTELLECTUAL PROPERTY
• Class recordings remain property of SmartTutor.
• Teachers may not distribute platform materials externally.

9. TERMINATION
SmartTutor may terminate this agreement immediately for:
• Sharing personal contact information
• Student complaints of misconduct
• Providing false credentials
• Violating any term of this agreement

10. TAX COMPLIANCE
Teachers are responsible for their own income tax declarations. SmartTutor deducts WHT at source as required by FBR Pakistan.

11. GOVERNING LAW
This agreement is governed by the laws of the Islamic Republic of Pakistan including PEMRA regulations.

12. CONTACT
Support: ${SUPPORT} | teachers@smarttutor.pk`,

    ur: `استاد سروس معاہدہ
سمارٹ ٹیوٹر پاکستان — ورژن 2.0

1. اہلیت
• کم از کم تعلیم: میٹرک پاس۔
• ڈگری سرٹیفکیٹ اور شناختی کارڈ لازمی۔
• ایک مرتبہ تصدیقی فیس: 500 روپے۔

2. سبسکرپشن
• پہلے 3 ماہ مفت۔
• چوتھے مہینے سے: 2 ڈالر ماہانہ۔
• سالانہ ڈگری تصدیق: 2 ڈالر۔

3. فیس اور کمائی
• سمارٹ ٹیوٹر کا کمیشن: 10%
• ود ہولڈنگ ٹیکس (FBR): 5%
• پروسیسنگ فیس طریقہ ادائیگی کے مطابق۔

4. ضابطہ اخلاق
• پلیٹ فارم سے باہر رابطہ معلومات شیئر کرنا سختی سے منع ہے۔
• خلاف ورزی پر فوری اکاؤنٹ بند۔

5. قانون
یہ معاہدہ پاکستان کے قوانین کے تحت ہے۔`,
  },

  privacyPolicy: `PRIVACY POLICY
SmartTutor Pakistan — Version 2.0

Effective Date: 2025

1. INFORMATION WE COLLECT
• Name, phone number, password (encrypted)
• For teachers: Degree certificates, CNIC (stored securely, not shared)
• Usage data: classes attended, payments made, session duration
• Device info: model, OS version (for technical support only)

2. HOW WE USE YOUR DATA
• To provide and improve our education services
• To process payments and send receipts
• To verify teacher credentials
• To monitor chat safety via automated AI systems
• To send class reminders and platform notifications

3. DATA PROTECTION
• All data is encrypted in transit (SSL/TLS) and at rest (AES-256).
• Passwords are hashed using bcrypt — we cannot see your password.
• CNIC and degree documents are stored in encrypted, access-controlled storage.
• Only authorized SmartTutor staff can access sensitive data.

4. WHAT WE NEVER DO
• We NEVER sell your personal data to any third party.
• We NEVER share your phone number with other users.
• We NEVER display your full CNIC to anyone, including teachers.
• We NEVER use your data for advertising outside SmartTutor.

5. CHAT MONITORING
• All in-app chats are monitored by automated AI systems.
• This is done solely to prevent sharing of personal contact info.
• Flagged messages are reviewed by admin only when violations are detected.

6. PAYMENT DATA
• Payment details are processed by JazzCash, EasyPaisa, or card processors.
• SmartTutor stores only transaction IDs and amounts — never full card numbers.

7. DATA RETENTION
• Your data is retained as long as your account is active.
• Deleted accounts: data removed within 30 days, except legally required records (7 years per FBR).

8. YOUR RIGHTS
• Access your data: request via support
• Correct inaccurate data: update in profile settings
• Delete your account: contact support (subject to legal retention requirements)

9. COOKIES & ANALYTICS
We use minimal analytics to improve app performance. No third-party advertising trackers.

10. CHILDREN'S PRIVACY
Students under 18 must have parental consent. We do not knowingly collect data from minors without consent.

11. CHANGES TO POLICY
We will notify all users of material changes to this policy via in-app notification.

12. CONTACT
Privacy Officer: privacy@smarttutor.pk | ${SUPPORT}
SmartTutor Pakistan`,

  termsOfService: `TERMS OF SERVICE
SmartTutor Pakistan — Version 2.0

1. THE PLATFORM
SmartTutor is an online education marketplace connecting students with qualified teachers across Pakistan. We do not directly provide teaching services; we provide the technology platform.

2. ACCOUNTS
• One account per person. Account sharing is prohibited.
• You are responsible for all activity under your account.
• Report unauthorized access immediately.

3. PROHIBITED ACTIVITIES
The following result in immediate permanent ban:
• Sharing phone numbers, WhatsApp, email, or any contact info
• Harassment, bullying, or inappropriate behavior
• Providing false information or fake credentials
• Attempting to bypass the platform for direct payments
• Recording or distributing class content without permission
• Any activity violating Pakistan law

4. PLATFORM FEES
• 10% commission on all teacher payments
• Processing fees per payment method (disclosed at checkout)
• 5% Withholding Tax deducted from teacher earnings per FBR

5. DISPUTE RESOLUTION
• All disputes first handled by SmartTutor admin team
• If unresolved, disputes subject to Pakistani courts (Lahore jurisdiction)
• SmartTutor's decision on platform violations is final

6. AVAILABILITY
We aim for 99.5% uptime but do not guarantee uninterrupted service. Planned maintenance announced 24 hours in advance.

7. INTELLECTUAL PROPERTY
SmartTutor name, logo, and platform design are proprietary. Unauthorized use is prohibited.

8. LIMITATION OF LIABILITY
SmartTutor's maximum liability is limited to fees paid in the last 30 days.

9. CHANGES TO TERMS
Material changes communicated via in-app notification 7 days in advance.

10. CONTACT
Legal: legal@smarttutor.pk | ${SUPPORT}`,
};

// ─── AGREEMENT MODAL ──────────────────────────────────────
function AgreementModal({visible, title, content, onAccept, onDecline}) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{flex:1,backgroundColor:'#000000CC',justifyContent:'flex-end'}}>
        <View style={{backgroundColor:C.surface,borderTopLeftRadius:28,borderTopRightRadius:28,
          maxHeight:'90%',borderTopWidth:2,borderTopColor:C.mint+'55'}}>
          <View style={{padding:20,borderBottomWidth:1,borderBottomColor:C.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{color:C.white,fontSize:16,fontWeight:'900',flex:1}}>{title}</Text>
            <Badge label="Legal Document" color={C.gold}/>
          </View>
          <ScrollView
            style={{padding:20,maxHeight:420}}
            onScrollEndDrag={() => setScrolled(true)}
            onMomentumScrollEnd={() => setScrolled(true)}>
            <Text style={{color:C.gray1,fontSize:12,lineHeight:20,fontFamily:'monospace'}}>{content}</Text>
            <View style={{height:40}}/>
          </ScrollView>
          {!scrolled && (
            <View style={{backgroundColor:C.orange+'22',padding:12,marginHorizontal:16,borderRadius:12,marginBottom:8}}>
              <Text style={{color:C.orange,fontSize:12,textAlign:'center'}}>⬇️ Please scroll down to read the full agreement</Text>
            </View>
          )}
          <View style={{padding:16,gap:12}}>
            <TouchableOpacity onPress={() => setChecked(p=>!p)}
              style={{flexDirection:'row',alignItems:'center',gap:12}}>
              <View style={{width:22,height:22,borderRadius:6,borderWidth:2,
                borderColor:checked?C.mint:C.gray3,backgroundColor:checked?C.mint+'22':'transparent',
                alignItems:'center',justifyContent:'center'}}>
                {checked && <Text style={{color:C.mint,fontSize:14,fontWeight:'900'}}>✓</Text>}
              </View>
              <Text style={{color:C.gray1,fontSize:13,flex:1,lineHeight:19}}>
                I have read, understood, and agree to these terms and conditions.
              </Text>
            </TouchableOpacity>
            <PBtn label="✅ I Agree & Continue" color={C.mint} textColor={C.bg}
              disabled={!checked} onPress={onAccept}/>
            <GBtn label="❌ Decline" color={C.red} onPress={onDecline}/>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── PAYMENT BREAKDOWN COMPONENT ──────────────────────────
function PaymentBreakdown({amount, method, pricingType}) {
  const calc = calcPayment(amount, method);
  const m = PAYMENT_METHODS.find(x => x.id === method);
  return (
    <NCard style={{padding:18,marginBottom:16}} glow={C.gold}>
      <Text style={{color:C.gray2,fontSize:12,fontWeight:'700',marginBottom:12,letterSpacing:0.8}}>PAYMENT BREAKDOWN</Text>
      {[
        [`Fee (${pricingType})`, `Rs. ${amount}`, C.white],
        ['Platform Fee (10%)', `- Rs. ${calc.platformFee}`, C.red],
        [`${m?.name||''} Fee (${((m?.fee||0)*100).toFixed(1)}%)`, `- Rs. ${calc.processingFee}`, C.orange],
        ['WHT Tax — FBR 5%', `- Rs. ${calc.wht}`, C.red],
        ['Teacher Receives', `Rs. ${calc.teacherNet}`, C.mint],
        ['You Pay', `Rs. ${amount}`, C.gold],
      ].map(([l,v,col],i) => (
        <View key={i} style={{flexDirection:'row',justifyContent:'space-between',
          paddingVertical:10,borderBottomWidth:i<5?1:0,borderBottomColor:C.border}}>
          <Text style={{color:C.gray2,fontSize:13}}>{l}</Text>
          <Text style={{color:col,fontSize:i===5?16:13,fontWeight:i===5?'900':'700'}}>{v}</Text>
        </View>
      ))}
      <Text style={{color:C.gray3,fontSize:10,marginTop:10,textAlign:'center',lineHeight:16}}>
        Taxes deducted per FBR Pakistan regulations. Processing fee varies by payment method.
      </Text>
    </NCard>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState('splash');
  const [lang, setLang] = useState('en'); // 'en' or 'ur'
  const [uType, setUType] = useState('');
  const [selT, setSelT] = useState(null);
  const [selCat, setSelCat] = useState('All');
  const [search, setSearch] = useState('');
  const [selPay, setSelPay] = useState('');
  const [regType, setRegType] = useState('student');
  const [logoTap, setLogoTap] = useState(0);
  const [teachers, setTeachers] = useState(TEACHERS_DATA);
  const [banned, setBanned] = useState([
    {id:1,name:'Student #4821',reason:'Phone number share kiya',time:'2 min ago'},
    {id:2,name:'Student #3341',reason:'WhatsApp link sent',time:'1 hr ago'},
  ]);
  const [sTab, setSTab] = useState('home');
  const [tTab, setTTab] = useState('home');
  const [classTime, setClassTime] = useState(2847);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [onboardPage, setOnboardPage] = useState(0);
  const [notifCount, setNotifCount] = useState(3);

  // Form states — controlled (fixes keyboard bug)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [regDegree, setRegDegree] = useState('');
  const [regUni, setRegUni] = useState('');
  const [regSubject, setRegSubject] = useState('');
  const [regLevel, setRegLevel] = useState('');
  const [regPricingType, setRegPricingType] = useState('Per Month');
  const [regFee, setRegFee] = useState('');
  const [regTiming, setRegTiming] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [isMinor, setIsMinor] = useState(false);

  // Agreements
  const [showStudentAgreement, setShowStudentAgreement] = useState(false);
  const [showTeacherAgreement, setShowTeacherAgreement] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const {show: toast, Toast} = useToast();

  const t = (en, ur) => lang === 'ur' ? ur : en;

  useEffect(() => {
    if (screen === 'splash') {
      Animated.parallel([
        Animated.timing(fade,{toValue:1,duration:1400,useNativeDriver:true}),
        Animated.timing(slide,{toValue:0,duration:1100,useNativeDriver:true}),
      ]).start();
      setTimeout(() => go(onboarded ? 'home' : 'onboard'), 2800);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'videoClass') {
      const timer = setInterval(() => setClassTime(p => p>0?p-1:0), 1000);
      return () => clearInterval(timer);
    }
  }, [screen]);

  const go = (s) => {
    fade.setValue(0); slide.setValue(18); setScreen(s);
    Animated.parallel([
      Animated.timing(fade,{toValue:1,duration:350,useNativeDriver:true}),
      Animated.timing(slide,{toValue:0,duration:300,useNativeDriver:true}),
    ]).start();
  };

  const handleLogoTap = () => {
    const n = logoTap + 1; setLogoTap(n);
    if (n >= 5) { setLogoTap(0); setAdminPhone(''); setAdminPass(''); go('adminLogin'); }
  };

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const approved = teachers.filter(tt => {
    if (tt.status !== 'approved') return false;
    const mc = selCat==='All' || tt.subject.includes(selCat);
    const ms = !search || tt.name.toLowerCase().includes(search.toLowerCase()) || tt.subject.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });
  const pending = teachers.filter(tt => tt.status === 'pending');

  const Wrap = ({children}) => (
    <Animated.View style={[{flex:1},{opacity:fade,transform:[{translateY:slide}]}]}>
      {children}{Toast}
      {/* Agreements */}
      <AgreementModal visible={showStudentAgreement} title="Student Agreement"
        content={LEGAL.studentAgreement[lang]} onAccept={() => { setShowStudentAgreement(false); setShowTeacherAgreement(false); setAgreementsAccepted(true); toast('✅ Agreement Accepted',C.mint); go(uType==='student'?'studentDash':'teacherDash'); }}
        onDecline={() => { setShowStudentAgreement(false); toast('❌ You must agree to continue',C.red); }} />
      <AgreementModal visible={showTeacherAgreement} title="Teacher Service Agreement"
        content={LEGAL.teacherAgreement[lang]} onAccept={() => { setShowTeacherAgreement(false); setAgreementsAccepted(true); toast('✅ Agreement Accepted',C.mint); go('teacherDash'); }}
        onDecline={() => { setShowTeacherAgreement(false); toast('❌ You must agree to continue',C.red); }} />
      <AgreementModal visible={showPrivacy} title="Privacy Policy"
        content={LEGAL.privacyPolicy} onAccept={() => setShowPrivacy(false)} onDecline={() => setShowPrivacy(false)} />
      <AgreementModal visible={showTerms} title="Terms of Service"
        content={LEGAL.termsOfService} onAccept={() => setShowTerms(false)} onDecline={() => setShowTerms(false)} />
    </Animated.View>
  );

  // Language toggle button
  const LangBtn = () => (
    <TouchableOpacity onPress={() => setLang(p => p==='en'?'ur':'en')}
      style={{backgroundColor:C.purple+'33',paddingHorizontal:12,paddingVertical:6,
        borderRadius:20,borderWidth:1,borderColor:C.purple}}>
      <Text style={{color:C.purple,fontWeight:'900',fontSize:12}}>{lang==='en'?'اردو':'EN'}</Text>
    </TouchableOpacity>
  );

  // ── SPLASH ──────────────────────────────────────────────
  if (screen === 'splash') return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg,justifyContent:'center',alignItems:'center'}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Animated.View style={{opacity:fade,transform:[{translateY:slide}],alignItems:'center'}}>
        <View style={{width:140,height:140,borderRadius:44,borderWidth:2,borderColor:C.mint+'35',
          alignItems:'center',justifyContent:'center',marginBottom:30}}>
          <STLogo size={110}/>
        </View>
        <Text style={{fontSize:36,fontWeight:'900',color:C.white,letterSpacing:1}}>SmartTutor</Text>
        <Text style={{fontSize:13,color:C.gray2,marginTop:8,textAlign:'center',letterSpacing:0.5}}>Pakistan Ka #1 Online Tuition Platform</Text>
        <View style={{flexDirection:'row',gap:8,marginTop:40}}>
          {[C.mint,C.cyan,C.purple,C.cyan,C.mint].map((c,i)=>(
            <View key={i} style={{width:8,height:8,borderRadius:4,backgroundColor:c,opacity:0.3+(i*0.17)}}/>
          ))}
        </View>
        <Text style={{color:C.gray3,fontSize:11,marginTop:20,letterSpacing:2.5}}>v{APP_VERSION}</Text>
      </Animated.View>
    </SafeAreaView>
  );

  // ── ONBOARDING ──────────────────────────────────────────
  if (screen === 'onboard') {
    const slides = [
      {icon:'🎓',color:C.mint,title:t('Pakistan\'s #1\nOnline Tuition','پاکستان کی نمبر ون\nآن لائن تعلیم'),desc:t('Learn from the best verified teachers from home. Every subject, every level.','گھر بیٹھ کر تصدیق شدہ اساتذہ سے پڑھیں۔ ہر مضمون، ہر سطح۔')},
      {icon:'🔐',color:C.cyan,title:t('100% Safe &\nSecure Platform','100% محفوظ\nپلیٹ فارم'),desc:t('AI monitoring, instant ban on violations. Your privacy is our priority.','AI نگرانی، خلاف ورزی پر فوری پابندی۔ آپ کی رازداری ہماری ترجیح ہے۔')},
      {icon:'💰',color:C.gold,title:t('Flexible Fees,\nQuality Education','لچکدار فیس،\nمعیاری تعلیم'),desc:t('Pay per day, weekend or month. JazzCash, EasyPaisa, Bank & Card accepted.','یومیہ، ہفتہ آخر یا ماہانہ ادائیگی۔ تمام طریقے قابل قبول۔')},
    ];
    const sl = slides[onboardPage];
    return (
      <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
        <View style={{position:'absolute',top:52,right:20,zIndex:10}}><LangBtn/></View>
        <View style={{flex:1,padding:32,justifyContent:'center',alignItems:'center'}}>
          <View style={{width:120,height:120,borderRadius:36,backgroundColor:sl.color+'20',
            alignItems:'center',justifyContent:'center',marginBottom:40,borderWidth:2,borderColor:sl.color+'40'}}>
            <Text style={{fontSize:56}}>{sl.icon}</Text>
          </View>
          <Text style={{fontSize:26,fontWeight:'900',color:C.white,textAlign:'center',lineHeight:36,marginBottom:16}}>{sl.title}</Text>
          <Text style={{fontSize:15,color:C.gray2,textAlign:'center',lineHeight:24,marginBottom:48}}>{sl.desc}</Text>
          <View style={{flexDirection:'row',gap:8,marginBottom:40}}>
            {slides.map((_,i) => (
              <View key={i} style={{width:i===onboardPage?24:8,height:8,borderRadius:4,
                backgroundColor:i===onboardPage?sl.color:C.card2}}/>
            ))}
          </View>
          <PBtn label={onboardPage<2 ? t('Next →','آگے →') : t('Get Started 🚀','شروع کریں 🚀')}
            color={sl.color} textColor={C.bg} style={{width:'100%'}}
            onPress={() => { if(onboardPage<2){setOnboardPage(p=>p+1);}else{setOnboarded(true);go('home');} }}/>
          {onboardPage<2 && (
            <TouchableOpacity onPress={() => { setOnboarded(true); go('home'); }} style={{marginTop:16}}>
              <Text style={{color:C.gray3,fontSize:14}}>{t('Skip →','چھوڑیں →')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── HOME ────────────────────────────────────────────────
  if (screen === 'home') return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Wrap>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{padding:28,paddingTop:48,backgroundColor:C.surface,
            borderBottomLeftRadius:28,borderBottomRightRadius:28}}>
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:20}}>
              <TouchableOpacity onPress={handleLogoTap} activeOpacity={1}
                style={{flexDirection:'row',alignItems:'center',gap:12,flex:1}}>
                <STLogo size={42}/>
                <View>
                  <Text style={{color:C.white,fontSize:22,fontWeight:'900',letterSpacing:0.5}}>SmartTutor</Text>
                  <Text style={{color:C.gray2,fontSize:11,marginTop:1}}>Pakistan Ka #1 Tuition Platform</Text>
                </View>
              </TouchableOpacity>
              <LangBtn/>
            </View>
            <Text style={{fontSize:30,fontWeight:'900',color:C.white,lineHeight:40}}>
              {t('Learn From Home,\n','گھر سے تعلیم،\n')}<Text style={{color:C.mint}}>{t('Grow Your Future','مستقبل بنائیں')}</Text>
            </Text>
            <View style={{flexDirection:'row',gap:10,marginTop:20}}>
              {[['10K+',t('Teachers','اساتذہ')],['2L+',t('Students','طلبا')],['50+',t('Subjects','مضامین')]].map(([n,l],i) => (
                <View key={i} style={{flex:1,backgroundColor:C.card,borderRadius:14,padding:14,
                  alignItems:'center',borderWidth:1,borderColor:C.border}}>
                  <Text style={{color:C.mint,fontSize:16,fontWeight:'900'}}>{n}</Text>
                  <Text style={{color:C.gray2,fontSize:10,marginTop:2}}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{padding:24,gap:14}}>
            <PBtn label={t('👨‍🎓  Student Login','👨‍🎓  طالب علم لاگ ان')} color={C.mint} textColor={C.bg}
              onPress={() => { setUType('student'); go('login'); }}/>
            <GBtn label={t('👨‍🏫  Teacher Login','👨‍🏫  استاد لاگ ان')} color={C.cyan}
              onPress={() => { setUType('teacher'); go('login'); }}/>
            <TouchableOpacity onPress={() => { haptic([30]); go('register'); }}
              style={{alignItems:'center',paddingVertical:8}}>
              <Text style={{color:C.gray2,fontSize:14}}>
                {t('New here? ','نئے ہیں؟ ')}<Text style={{color:C.mint,fontWeight:'800'}}>{t('Register →','رجسٹر کریں →')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{paddingHorizontal:20,paddingBottom:20}}>
            <SLabel>{t('Platform Features','پلیٹ فارم کی خصوصیات')}</SLabel>
            {[
              [C.mint,'🔐',t('100% Secure','100% محفوظ'),t('AI monitoring — contact share = instant ban','AI نگرانی — رابطہ شیئر = فوری پابندی')],
              [C.cyan,'✅',t('Verified Teachers','تصدیق شدہ اساتذہ'),t('Degree + CNIC verified by admin','ڈگری + شناختی کارڈ تصدیق شدہ')],
              [C.purple,'💳',t('Flexible Payments','لچکدار ادائیگی'),t('JazzCash · EasyPaisa · Bank · Card','جاز کیش · ایزی پیسہ · بینک · کارڈ')],
              [C.gold,'📅',t('Flexible Pricing','لچکدار قیمت'),t('Per Day · Per Weekend · Per Month','یومیہ · ہفتہ آخر · ماہانہ')],
              [C.orange,'🎥',t('Live Video Classes','لائیو ویڈیو کلاسز'),t('Whiteboard · Attendance · Chat','وائٹ بورڈ · حاضری · چیٹ')],
              [C.blue,'📊',t('Progress Tracking','ترقی کی نگرانی'),t('Detailed reports per subject','ہر مضمون کی تفصیلی رپورٹ')],
            ].map(([col,ic,ti,de],i) => (
              <NCard key={i} style={{padding:16,marginBottom:10,flexDirection:'row',gap:14,alignItems:'center'}} glow={col}>
                <View style={{width:48,height:48,borderRadius:14,backgroundColor:col+'18',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:24}}>{ic}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{ti}</Text>
                  <Text style={{color:C.gray2,fontSize:12,marginTop:3,lineHeight:17}}>{de}</Text>
                </View>
              </NCard>
            ))}
          </View>

          {/* Legal Links */}
          <View style={{paddingHorizontal:20,paddingBottom:40,gap:10}}>
            <Text style={{color:C.gray3,fontSize:12,textAlign:'center',letterSpacing:0.5}}>LEGAL DOCUMENTS</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
              {[['Privacy Policy',()=>setShowPrivacy(true)],['Terms of Service',()=>setShowTerms(true)]].map(([label,fn],i)=>(
                <TouchableOpacity key={i} onPress={fn}
                  style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:C.border}}>
                  <Text style={{color:C.cyan,fontSize:12}}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── ADMIN LOGIN ─────────────────────────────────────────
  if (screen === 'adminLogin') return (
    <SafeAreaView style={[S.flex,{backgroundColor:'#04000A'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#04000A"/>
      <Wrap>
        <View style={{flex:1,padding:28,justifyContent:'center'}}>
          <View style={{alignItems:'center',marginBottom:44}}>
            <View style={{width:84,height:84,borderRadius:26,backgroundColor:C.red+'28',
              borderWidth:2,borderColor:C.red+'55',alignItems:'center',justifyContent:'center',marginBottom:18}}>
              <STLogo size={60}/>
            </View>
            <Text style={{color:C.white,fontSize:26,fontWeight:'900',letterSpacing:0.8}}>Admin Portal</Text>
            <Text style={{color:C.gray3,fontSize:12,marginTop:6,textAlign:'center'}}>SmartTutor Secure Access — {APP_VERSION}</Text>
          </View>
          <NCard style={{padding:24}} glow={C.red}>
            {/* FIXED: single controlled state — no keyboard dismiss */}
            <Input label="Admin Phone" placeholder="03XX-XXXXXXX" keyboardType="phone-pad"
              value={adminPhone} onChangeText={setAdminPhone}/>
            <Input label="Admin Password" placeholder="••••••••••••" secureTextEntry
              value={adminPass} onChangeText={setAdminPass}/>
            <PBtn label="🔐 Login to Dashboard" color={C.red} textColor={C.white} onPress={() => {
              if (adminPhone===ADMIN_PHONE && adminPass===ADMIN_PASS) {
                haptic([50,50,200]); go('adminDash');
              } else {
                haptic([100,100,100]); toast('❌ Wrong Credentials',C.red);
              }
            }}/>
            <GBtn label="← Back" color={C.gray2} style={{marginTop:12}} onPress={() => go('home')}/>
          </NCard>
          <Text style={{color:C.gray4,fontSize:10,textAlign:'center',marginTop:20}}>
            Unauthorized access is a criminal offense under Pakistan Cybercrime Act.
          </Text>
        </View>
      </Wrap>
    </SafeAreaView>
  );

  // ── ADMIN DASHBOARD ──────────────────────────────────────
  if (screen === 'adminDash') return (
    <SafeAreaView style={[S.flex,{backgroundColor:'#04000A'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#04000A"/>
      <Wrap>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:18,
          backgroundColor:C.surface,borderBottomWidth:1,borderBottomColor:C.red+'40'}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            <STLogo size={36}/>
            <View>
              <Text style={{color:C.red,fontSize:16,fontWeight:'900'}}>Admin Panel</Text>
              <Text style={{color:C.gray3,fontSize:11}}>Full Control</Text>
            </View>
          </View>
          <TouchableOpacity onPress={()=>Alert.alert('Logout?','',[{text:'Cancel'},{text:'Logout',style:'destructive',onPress:()=>go('home')}])}>
            <Badge label="🔒 Logout" color={C.red}/>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{padding:18}}>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:4}}>
            {[[teachers.filter(t=>t.status==='approved').length+'','👨‍🏫 Teachers',C.mint],
              ['48,200','👨‍🎓 Students',C.cyan],
              ['Rs.8.2L','💰 Revenue',C.gold],
              [pending.length+'','⏳ Pending',C.red]
            ].map(([v,l,col],i)=>(
              <View key={i} style={{flex:1,minWidth:'45%',backgroundColor:C.card,borderRadius:16,padding:16,
                alignItems:'center',borderWidth:1,borderColor:col+'35',marginBottom:4}}>
                <Text style={{color:col,fontSize:20,fontWeight:'900'}}>{v}</Text>
                <Text style={{color:C.gray2,fontSize:10,marginTop:4,textAlign:'center'}}>{l}</Text>
              </View>
            ))}
          </View>

          <SLabel color={C.gold}>💰 Revenue Report</SLabel>
          <NCard style={{padding:20}} glow={C.gold}>
            {[['Today','Rs.12,400'],['This Week','Rs.84,000'],['This Month','Rs.3,20,000'],['Total','Rs.8,20,000']].map(([p,a],i)=>(
              <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:11,
                borderBottomWidth:i<3?1:0,borderBottomColor:C.border}}>
                <Text style={{color:C.gray2,fontSize:14}}>{p}</Text>
                <Text style={{color:C.gold,fontSize:15,fontWeight:'900'}}>{a}</Text>
              </View>
            ))}
          </NCard>

          <SLabel color={C.orange}>⏳ Pending Approvals ({pending.length})</SLabel>
          {pending.length===0
            ? <NCard style={{padding:20,alignItems:'center'}}><Text style={{color:C.gray2}}>✅ No pending applications</Text></NCard>
            : pending.map(tt => (
              <NCard key={tt.id} style={{padding:16,marginBottom:10}} glow={C.orange}>
                <Text style={{color:C.white,fontSize:15,fontWeight:'800'}}>{tt.name}</Text>
                <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>{tt.degree} · {tt.uni}</Text>
                <Text style={{color:C.orange,fontSize:12,marginTop:2}}>Rs.{tt.fee}/{tt.pricingType}</Text>
                <View style={{flexDirection:'row',gap:10,marginTop:12}}>
                  <TouchableOpacity style={[S.approveBtn,{flex:1,alignItems:'center'}]} onPress={() => {
                    haptic([80]); setTeachers(p=>p.map(x=>x.id===tt.id?{...x,status:'approved',available:true,verified:true}:x));
                    toast('✅ '+tt.name+' Approved!',C.mint);
                  }}>
                    <Text style={{color:C.mint,fontWeight:'800',fontSize:13}}>✅ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.rejectBtn,{flex:1,alignItems:'center'}]} onPress={() => {
                    haptic([100,100]); setTeachers(p=>p.filter(x=>x.id!==tt.id));
                    toast('❌ Rejected',C.red);
                  }}>
                    <Text style={{color:C.red,fontWeight:'800',fontSize:13}}>❌ Reject</Text>
                  </TouchableOpacity>
                </View>
              </NCard>
            ))
          }

          <SLabel color={C.cyan}>👨‍🏫 Active Teachers</SLabel>
          {teachers.filter(tt=>tt.status==='approved').map(tt => (
            <NCard key={tt.id} style={{padding:16,marginBottom:10}} glow={C.cyan}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{flex:1}}>
                  <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{tt.name}</Text>
                  <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>{tt.subject} · {tt.students} students</Text>
                  <View style={{flexDirection:'row',gap:6,marginTop:6,flexWrap:'wrap'}}>
                    <Badge label={'⭐'+tt.rating} color={C.gold} small/>
                    <Badge label={`Rs.${tt.fee}/${tt.pricingType}`} color={C.mint} small/>
                    <Badge label={tt.experience} color={C.cyan} small/>
                  </View>
                </View>
                <TouchableOpacity style={[S.rejectBtn,{marginLeft:10}]}
                  onPress={() => Alert.alert('Ban Teacher?',tt.name,[{text:'Cancel'},{text:'Ban',style:'destructive',onPress:()=>{
                    setTeachers(p=>p.filter(x=>x.id!==tt.id)); toast('🚫 Banned',C.red);
                  }}])}>
                  <Text style={{color:C.red,fontWeight:'800',fontSize:12}}>🚫 Ban</Text>
                </TouchableOpacity>
              </View>
            </NCard>
          ))}

          <SLabel color={C.red}>🔐 Security Alerts</SLabel>
          {banned.map((u,i) => (
            <NCard key={i} style={{padding:16,marginBottom:10,borderLeftWidth:3,borderLeftColor:C.red}} glow={C.red}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{flex:1}}>
                  <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{u.name}</Text>
                  <Text style={{color:C.red,fontSize:12,marginTop:2}}>{u.reason}</Text>
                  <Text style={{color:C.gray3,fontSize:11,marginTop:2}}>{u.time}</Text>
                </View>
                <TouchableOpacity style={[S.approveBtn,{marginLeft:10}]}
                  onPress={() => { setBanned(p=>p.filter((_,idx)=>idx!==i)); toast('✅ Unbanned',C.mint); }}>
                  <Text style={{color:C.mint,fontWeight:'800',fontSize:12}}>Unban</Text>
                </TouchableOpacity>
              </View>
            </NCard>
          ))}

          <SLabel color={C.purple}>💸 Withdrawal Requests</SLabel>
          {[{teacher:'Ahmad Ali',amount:27000,method:'JazzCash'},{teacher:'Qari Imran',amount:13500,method:'EasyPaisa'},{teacher:'Sara Khan',amount:18200,method:'Bank Transfer'}].map((w,i) => {
            const wht = Math.round(w.amount * TAX.WHT_TEACHER);
            const net = w.amount - wht;
            return (
              <NCard key={i} style={{padding:16,marginBottom:10}} glow={C.purple}>
                <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{w.teacher}</Text>
                <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>Requested: Rs.{w.amount} via {w.method}</Text>
                <Text style={{color:C.red,fontSize:11,marginTop:2}}>WHT (5%): - Rs.{wht}</Text>
                <Text style={{color:C.mint,fontSize:13,fontWeight:'800',marginTop:2}}>Net Payout: Rs.{net}</Text>
                <View style={{flexDirection:'row',gap:8,marginTop:12}}>
                  <TouchableOpacity style={[S.approveBtn,{flex:1,alignItems:'center'}]}
                    onPress={() => toast('✅ Rs.'+net+' Approved to '+w.teacher,C.mint)}>
                    <Text style={{color:C.mint,fontWeight:'800',fontSize:12}}>✅ Approve Rs.{net}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.rejectBtn,{flex:1,alignItems:'center'}]}
                    onPress={() => toast('❌ Rejected',C.red)}>
                    <Text style={{color:C.red,fontWeight:'800',fontSize:12}}>❌ Reject</Text>
                  </TouchableOpacity>
                </View>
              </NCard>
            );
          })}

          <SLabel color={C.cyan}>📢 Announcement</SLabel>
          <NCard style={{padding:20}} glow={C.cyan}>
            <TextInput style={{backgroundColor:C.card2,borderRadius:12,padding:16,color:C.white,
              height:90,textAlignVertical:'top',borderWidth:1,borderColor:C.border,fontSize:14,marginBottom:14}}
              placeholder="Send message to all users..." placeholderTextColor={C.gray3} multiline/>
            <PBtn label="📢 Send to All Users" color={C.cyan} textColor={C.bg}
              onPress={() => toast('📢 Announcement Sent!',C.cyan)}/>
          </NCard>

          <GBtn label="← Secure Logout" color={C.red} style={{marginTop:24,marginBottom:40}}
            onPress={() => Alert.alert('Logout','Are you sure?',[{text:'Cancel'},{text:'Logout',style:'destructive',onPress:()=>go('home')}])}/>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── LOGIN ───────────────────────────────────────────────
  if (screen === 'login') return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Wrap>
        <TopBar title={uType==='student'?t('👨‍🎓 Student Login','👨‍🎓 طالب علم لاگ ان'):t('👨‍🏫 Teacher Login','👨‍🏫 استاد لاگ ان')}
          onBack={() => go('home')} right={<LangBtn/>}/>
        <ScrollView contentContainerStyle={{padding:24}}>
          <NCard style={{padding:24,marginTop:8}} glow={uType==='student'?C.mint:C.cyan}>
            <Input label={t('Phone Number','فون نمبر')} placeholder="03XX-XXXXXXX"
              keyboardType="phone-pad" value={loginPhone} onChangeText={setLoginPhone}/>
            <Input label={t('Password','پاس ورڈ')} placeholder="••••••••••" secureTextEntry
              value={loginPass} onChangeText={setLoginPass}/>
            <TouchableOpacity style={{alignSelf:'flex-end',marginBottom:20}}>
              <Text style={{color:C.cyan,fontSize:13,fontWeight:'700'}}>{t('Forgot Password?','پاس ورڈ بھول گئے؟')}</Text>
            </TouchableOpacity>
            <PBtn label={t('Login →','لاگ ان کریں →')} color={uType==='student'?C.mint:C.cyan} textColor={C.bg}
              onPress={() => {
                if (!loginPhone || !loginPass) { toast('❌ '+t('Enter phone & password','فون اور پاس ورڈ درج کریں'),C.red); return; }
                // Show agreement before dashboard access
                if (uType === 'student') { setShowStudentAgreement(true); }
                else { setShowTeacherAgreement(true); }
              }}/>
            <TouchableOpacity onPress={() => go('register')} style={{alignItems:'center',marginTop:20}}>
              <Text style={{color:C.gray2,fontSize:14}}>
                {t('New? ','نئے ہیں؟ ')}<Text style={{color:C.mint,fontWeight:'800'}}>{t('Register →','رجسٹر کریں →')}</Text>
              </Text>
            </TouchableOpacity>
          </NCard>
          {uType==='teacher' && (
            <TouchableOpacity onPress={() => go('teacherSubscription')} style={{marginTop:16}}>
              <NCard style={{padding:16,flexDirection:'row',alignItems:'center',gap:12}} glow={C.gold}>
                <STLogo size={32}/>
                <View style={{flex:1}}>
                  <Text style={{color:C.gold,fontSize:14,fontWeight:'800'}}>{t('View Subscription Benefits','سبسکرپشن فوائد دیکھیں')}</Text>
                  <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>{t('$2/month from Month 4 • First 3 months FREE','3 ماہ مفت پھر $2 ماہانہ')}</Text>
                </View>
                <Text style={{color:C.gold}}>→</Text>
              </NCard>
            </TouchableOpacity>
          )}
          {/* Legal docs */}
          <View style={{flexDirection:'row',justifyContent:'center',gap:16,marginTop:24}}>
            <TouchableOpacity onPress={() => setShowPrivacy(true)}>
              <Text style={{color:C.gray3,fontSize:12}}>{t('Privacy Policy','رازداری پالیسی')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTerms(true)}>
              <Text style={{color:C.gray3,fontSize:12}}>{t('Terms of Service','سروس کی شرائط')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── REGISTER ────────────────────────────────────────────
  if (screen === 'register') return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Wrap>
        <TopBar title={t('New Registration','نئی رجسٹریشن')} onBack={() => go('home')} right={<LangBtn/>}/>
        <ScrollView contentContainerStyle={{padding:24}}>
          {/* Role Selector */}
          <View style={{flexDirection:'row',gap:10,marginBottom:22}}>
            {['student','teacher'].map(tp => (
              <TouchableOpacity key={tp} onPress={() => { haptic([30]); setRegType(tp); }}
                style={{flex:1,paddingVertical:14,borderRadius:14,alignItems:'center',
                  backgroundColor:regType===tp?C.mint:C.card,borderWidth:1.5,
                  borderColor:regType===tp?C.mint:C.border}}>
                <Text style={{color:regType===tp?C.bg:C.gray2,fontWeight:'800',fontSize:14}}>
                  {tp==='student'?t('👨‍🎓 Student','👨‍🎓 طالب علم'):t('👨‍🏫 Teacher','👨‍🏫 استاد')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <NCard style={{padding:22}} glow={C.mint}>
            <Input label={t('Full Name','پورا نام')} placeholder={t('Your full name','اپنا پورا نام')}
              value={regName} onChangeText={setRegName}/>
            <Input label={t('Phone Number','فون نمبر')} placeholder="03XX-XXXXXXX"
              keyboardType="phone-pad" value={regPhone} onChangeText={setRegPhone}/>
            <Input label={t('Password','پاس ورڈ')} placeholder={t('Create a strong password','مضبوط پاس ورڈ بنائیں')}
              secureTextEntry value={regPass} onChangeText={setRegPass}/>
            <Input label={t('Confirm Password','پاس ورڈ تصدیق')} placeholder={t('Re-enter password','دوبارہ درج کریں')}
              secureTextEntry value={regPass2} onChangeText={setRegPass2}/>

            {/* Minor toggle */}
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',
              backgroundColor:C.card2,padding:14,borderRadius:12,marginBottom:14}}>
              <View style={{flex:1}}>
                <Text style={{color:C.white,fontSize:14,fontWeight:'700'}}>{t('Are you under 18?','کیا آپ 18 سال سے کم ہیں؟')}</Text>
                <Text style={{color:C.gray2,fontSize:11,marginTop:2}}>{t('Parent/guardian consent required','والدین/سرپرست کی منظوری ضروری')}</Text>
              </View>
              <Switch value={isMinor} onValueChange={setIsMinor}
                trackColor={{false:C.gray3,true:C.mint+'88'}} thumbColor={isMinor?C.mint:C.gray2}/>
            </View>

            {isMinor && (
              <View style={{backgroundColor:C.orange+'15',borderRadius:12,padding:14,
                borderLeftWidth:3,borderLeftColor:C.orange,marginBottom:14}}>
                <Text style={{color:C.orange,fontSize:13,fontWeight:'700',marginBottom:8}}>
                  {t('Parent/Guardian Consent','والدین/سرپرست کی منظوری')}
                </Text>
                <TouchableOpacity onPress={() => setParentConsent(p=>!p)}
                  style={{flexDirection:'row',alignItems:'center',gap:10}}>
                  <View style={{width:20,height:20,borderRadius:5,borderWidth:2,
                    borderColor:parentConsent?C.orange:C.gray3,backgroundColor:parentConsent?C.orange+'22':'transparent',
                    alignItems:'center',justifyContent:'center'}}>
                    {parentConsent && <Text style={{color:C.orange,fontSize:12,fontWeight:'900'}}>✓</Text>}
                  </View>
                  <Text style={{color:C.gray1,fontSize:12,flex:1,lineHeight:18}}>
                    {t('I am the parent/guardian and consent to my child using SmartTutor.',
                       'میں والدین/سرپرست ہوں اور اپنے بچے کو سمارٹ ٹیوٹر استعمال کرنے کی اجازت دیتا ہوں۔')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Teacher extra fields */}
            {regType === 'teacher' && <>
              <Input label={t('Degree / Qualification','ڈگری / قابلیت')}
                placeholder={t('e.g. MSc Mathematics, Hafiz-e-Quran','مثلاً MSc ریاضی')}
                value={regDegree} onChangeText={setRegDegree}/>
              <Input label={t('University / Board / Institution','یونیورسٹی / بورڈ / ادارہ')}
                placeholder={t('e.g. University of Punjab','مثلاً یونیورسٹی آف پنجاب')}
                value={regUni} onChangeText={setRegUni}/>
              <Input label={t('Subject','مضمون')} placeholder={t('Main subject you teach','آپ کا مضمون')}
                value={regSubject} onChangeText={setRegSubject}/>
              <Input label={t('Student Level','طالب علم کی سطح')}
                placeholder={t('e.g. Matric, Intermediate, All Ages','مثلاً میٹرک، انٹر')}
                value={regLevel} onChangeText={setRegLevel}/>

              {/* Pricing Type */}
              <Text style={{color:C.gray1,fontSize:12,fontWeight:'700',marginBottom:7,letterSpacing:0.8,textTransform:'uppercase'}}>
                {t('PRICING TYPE','قیمت کی قسم')}
              </Text>
              <View style={{flexDirection:'row',gap:8,marginBottom:14}}>
                {PRICING_TYPES.map(pt => (
                  <TouchableOpacity key={pt} onPress={() => setRegPricingType(pt)}
                    style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:'center',
                      backgroundColor:regPricingType===pt?C.mint:C.card2,
                      borderWidth:1,borderColor:regPricingType===pt?C.mint:C.border}}>
                    <Text style={{color:regPricingType===pt?C.bg:C.gray2,fontSize:10,fontWeight:'800'}}>
                      {pt==='Per Day'?t('Per Day','یومیہ'):pt==='Per Weekend'?t('Weekend','ہفتہ آخر'):t('Monthly','ماہانہ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label={t(`FEE (${regPricingType.toUpperCase()})`,`فیس (${regPricingType})`)}
                placeholder="e.g. 700" keyboardType="number-pad"
                value={regFee} onChangeText={setRegFee}/>
              <Input label={t('Class Timing','کلاس کا وقت')}
                placeholder={t('e.g. Mon–Thu 6–7 PM','مثلاً پیر–جمعرات 6–7 شام')}
                value={regTiming} onChangeText={setRegTiming}/>

              <NCard style={{padding:14,marginBottom:14}} glow={C.gold}>
                <Text style={{color:C.gold,fontSize:13,fontWeight:'700',marginBottom:8}}>
                  💰 {t('Degree Verification Fee','ڈگری تصدیق فیس')}
                </Text>
                <Text style={{color:C.gray1,fontSize:12,lineHeight:20}}>
                  {t('• One-time verification fee: Rs. 500\n• First 3 months subscription: FREE\n• From Month 4: $2 USD/month\n• Annual degree re-verification: $2 USD/year\n• Platform commission: 10% per transaction\n• WHT tax (FBR): 5% of earnings',
                     '• ایک مرتبہ تصدیقی فیس: 500 روپے\n• پہلے 3 ماہ سبسکرپشن: مفت\n• چوتھے مہینے سے: 2 ڈالر ماہانہ\n• پلیٹ فارم کمیشن: 10%\n• WHT ٹیکس: 5%')}
                </Text>
              </NCard>
            </>}

            <PBtn label={t('Create Account →','اکاؤنٹ بنائیں →')} color={C.mint} textColor={C.bg}
              onPress={() => {
                if (!regName || !regPhone || !regPass) { toast('❌ '+t('Fill all required fields','تمام ضروری فیلڈز بھریں'),C.red); return; }
                if (regPass !== regPass2) { toast('❌ '+t('Passwords do not match','پاس ورڈ مختلف ہیں'),C.red); return; }
                if (isMinor && !parentConsent) { toast('❌ '+t('Parent consent required for minors','نابالغ کے لیے والدین کی منظوری ضروری'),C.red); return; }
                if (regType === 'student') { setUType('student'); setShowStudentAgreement(true); }
                else { setUType('teacher'); setShowTeacherAgreement(true); }
              }}/>
          </NCard>

          <View style={{flexDirection:'row',justifyContent:'center',gap:16,marginTop:16,marginBottom:30}}>
            <TouchableOpacity onPress={() => setShowPrivacy(true)}>
              <Text style={{color:C.gray3,fontSize:12}}>{t('Privacy Policy','رازداری')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTerms(true)}>
              <Text style={{color:C.gray3,fontSize:12}}>{t('Terms of Service','شرائط')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── TEACHER SUBSCRIPTION ────────────────────────────────
  if (screen === 'teacherSubscription') return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Wrap>
        <TopBar title={t('💎 Subscription Plans','💎 سبسکرپشن')} onBack={() => go('login')} right={<LangBtn/>}/>
        <ScrollView contentContainerStyle={{padding:20}}>
          <NCard style={{padding:24,alignItems:'center',marginBottom:20}} glow={C.gold}>
            <STLogo size={64}/>
            <Text style={{color:C.gold,fontSize:22,fontWeight:'900',marginTop:14,textAlign:'center'}}>
              {t('Teacher Subscription','استاد سبسکرپشن')}
            </Text>
            <View style={{flexDirection:'row',gap:12,marginTop:20}}>
              <NCard style={{flex:1,padding:16,alignItems:'center'}} glow={C.mint}>
                <Text style={{color:C.gray2,fontSize:10,fontWeight:'700'}}>MONTHS 1–3</Text>
                <Text style={{color:C.mint,fontSize:28,fontWeight:'900',marginTop:4}}>FREE</Text>
                <Text style={{color:C.gray2,fontSize:11,marginTop:3}}>Trial Period</Text>
              </NCard>
              <NCard style={{flex:1,padding:16,alignItems:'center'}} glow={C.gold}>
                <Text style={{color:C.gray2,fontSize:10,fontWeight:'700'}}>MONTH 4+</Text>
                <Text style={{color:C.gold,fontSize:28,fontWeight:'900',marginTop:4}}>$2</Text>
                <Text style={{color:C.gray2,fontSize:11,marginTop:3}}>per month</Text>
              </NCard>
            </View>
            <View style={{backgroundColor:C.purple+'22',padding:12,borderRadius:12,marginTop:16,width:'100%'}}>
              <Text style={{color:C.purple,fontSize:12,textAlign:'center',fontWeight:'700'}}>
                + Rs. 500 {t('one-time degree verification','ایک مرتبہ ڈگری تصدیق')} | $2 {t('annual renewal','سالانہ تجدید')}
              </Text>
            </View>
          </NCard>

          <SLabel>{t('✅ What You Get','✅ آپ کو کیا ملے گا')}</SLabel>
          {[
            [C.mint,'👥',t('Up to 100 Students Per Group','100 طلبا فی گروپ'),t('Create private class groups','نجی کلاس گروپ بنائیں')],
            [C.cyan,'🎥',t('Live Video Classes','لائیو ویڈیو کلاسز'),t('Built-in video, no external apps needed','بلٹ ان ویڈیو')],
            [C.purple,'💳',t('Automatic Payment Collection','خودکار ادائیگی وصولی'),t('Students pay, you receive automatically','طلبا ادا کریں، آپ کو خودکار ملے')],
            [C.gold,'💸',t('Monthly Withdrawals','ماہانہ نکاسی'),t('JazzCash, EasyPaisa, Bank Transfer','جاز کیش، ایزی پیسہ، بینک')],
            [C.orange,'📅',t('Flexible Pricing','لچکدار قیمت'),t('Set fee per Day, Weekend or Month','یومیہ، ہفتہ آخر یا ماہانہ فیس')],
            [C.blue,'📊',t('Student Analytics','طلبا تجزیہ'),t('Attendance, progress, payment reports','حاضری، ترقی، ادائیگی رپورٹس')],
            [C.mint,'✅',t('Verified Badge','تصدیق شدہ بیج'),t('Builds trust with students','طلبا کا اعتماد بڑھائیں')],
            [C.red,'🛡️',t('Admin Support','ایڈمن سپورٹ'),t('Platform handles all disputes','پلیٹ فارم تمام تنازعات سنبھالتا ہے')],
          ].map(([col,ic,ti,de],i) => (
            <View key={i} style={{flexDirection:'row',gap:14,paddingVertical:13,
              borderBottomWidth:1,borderBottomColor:C.border,alignItems:'flex-start'}}>
              <View style={{width:42,height:42,borderRadius:12,backgroundColor:col+'18',
                alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Text style={{fontSize:20}}>{ic}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{ti}</Text>
                <Text style={{color:C.gray2,fontSize:12,marginTop:3,lineHeight:17}}>{de}</Text>
              </View>
              <Text style={{color:C.mint,fontSize:18}}>✓</Text>
            </View>
          ))}

          <SLabel>{t('💰 Earnings Example','💰 کمائی کی مثال')}</SLabel>
          <NCard style={{padding:20,marginBottom:20}} glow={C.mint}>
            <Text style={{color:C.gray3,fontSize:11,marginBottom:10}}>
              {t('Based on 50 students @ Rs.700/month','50 طلبا @ 700 روپے ماہانہ کی بنیاد پر')}
            </Text>
            {(() => {
              const gross = 50 * 700;
              const calc = calcPayment(gross, 'jazzcash');
              return [
                [t('Total Fees Collected','کل فیس وصول'),`Rs. ${gross.toLocaleString()}`,C.white],
                [t('Platform Fee (10%)','پلیٹ فارم فیس 10%'),`- Rs. ${calc.platformFee.toLocaleString()}`,C.red],
                [t('WHT Tax 5% (FBR)','WHT ٹیکس 5%'),`- Rs. ${calc.wht.toLocaleString()}`,C.red],
                [t('JazzCash Fee (1.5%)','جاز کیش فیس 1.5%'),`- Rs. ${calc.processingFee.toLocaleString()}`,C.orange],
                [t('Your Net Earnings','آپ کی خالص کمائی'),`Rs. ${calc.teacherNet.toLocaleString()}`,C.mint],
              ].map(([l,v,col],i)=>(
                <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,
                  borderBottomWidth:i<4?1:0,borderBottomColor:C.border}}>
                  <Text style={{color:C.gray2,fontSize:12}}>{l}</Text>
                  <Text style={{color:col,fontSize:i===4?16:13,fontWeight:'800'}}>{v}</Text>
                </View>
              ));
            })()}
          </NCard>

          <PBtn label={t('🚀 Register as Teacher','🚀 استاد کے طور پر رجسٹر کریں')}
            color={C.mint} textColor={C.bg} onPress={() => go('register')}/>
          <GBtn label={t('← Back to Login','← لاگ ان پر واپس')} color={C.cyan}
            style={{marginTop:12,marginBottom:30}} onPress={() => go('login')}/>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── STUDENT DASHBOARD ───────────────────────────────────
  if (screen === 'studentDash') {
    const renderHome = () => (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:18}}>
        <NCard style={{padding:16,marginBottom:16,flexDirection:'row',alignItems:'center',gap:12,
          borderLeftWidth:3,borderLeftColor:C.red}} glow={C.red}>
          <Text style={{fontSize:22}}>⚠️</Text>
          <View style={{flex:1}}>
            <Text style={{color:C.white,fontSize:13,fontWeight:'800'}}>Rs.700 Maths fee — 3 days left!</Text>
            <Text style={{color:C.gray2,fontSize:11,marginTop:2}}>Pay now to keep class access</Text>
          </View>
          <PBtn label="Pay" color={C.red} textColor={C.white} size="sm" style={{minWidth:56}}
            onPress={() => go('payment')}/>
        </NCard>

        <View style={{flexDirection:'row',gap:10,marginBottom:10}}>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:C.mint+'35'}}>
            <Text style={{color:C.mint,fontSize:20,fontWeight:'900'}}>3</Text>
            <Text style={{color:C.gray2,fontSize:10,marginTop:4}}>{t('Active Classes','فعال کلاسز')}</Text>
          </View>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:C.cyan+'35'}}>
            <Text style={{color:C.cyan,fontSize:20,fontWeight:'900'}}>85%</Text>
            <Text style={{color:C.gray2,fontSize:10,marginTop:4}}>{t('Attendance','حاضری')}</Text>
          </View>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:C.gold+'35'}}>
            <Text style={{color:C.gold,fontSize:20,fontWeight:'900'}}>🔥7</Text>
            <Text style={{color:C.gray2,fontSize:10,marginTop:4}}>{t('Day Streak','دن سلسلہ')}</Text>
          </View>
        </View>

        <SLabel>{t('📚 My Classes','📚 میری کلاسز')}</SLabel>
        {[
          {sub:'Mathematics',teacher:'Ahmad Ali',time:'6:00 PM',day:'Mon–Thu',fee:700,pricingType:'Per Month',link:'ST-MATH-A1'},
          {sub:'English',teacher:'Sara Khan',time:'5:00 PM',day:'Sat–Sun',fee:250,pricingType:'Per Weekend',link:'ST-ENG-S4'},
          {sub:'Quran Tajweed',teacher:'Qari Imran',time:'6:30 AM',day:'Mon–Fri',fee:300,pricingType:'Per Month',link:'ST-QRN-Q3'},
        ].map((cls,i) => (
          <NCard key={i} style={{padding:16,marginBottom:10}} glow={C.mint}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
              <View style={{flex:1}}>
                <Text style={{color:C.white,fontSize:15,fontWeight:'900'}}>{cls.sub}</Text>
                <Text style={{color:C.gray2,fontSize:12,marginTop:3}}>👨‍🏫 {cls.teacher} · ⏰ {cls.time}</Text>
                <View style={{flexDirection:'row',gap:6,marginTop:8,flexWrap:'wrap'}}>
                  <Badge label={'🔗 '+cls.link} color={C.cyan} small/>
                  <Badge label={`Rs.${cls.fee}/${cls.pricingType}`} color={C.mint} small/>
                </View>
              </View>
              <PBtn label="🎥 Join" color={C.mint} textColor={C.bg} size="sm"
                style={{minWidth:76,marginLeft:10}} onPress={() => { haptic([50,50]); go('videoClass'); }}/>
            </View>
          </NCard>
        ))}
        <PBtn label={t('🔍 Find New Teacher','🔍 نیا استاد تلاش کریں')} color={C.purple} textColor={C.white}
          style={{marginTop:8}} onPress={() => setSTab('search')}/>
      </ScrollView>
    );

    const renderSearch = () => (
      <>
        <View style={{padding:14,backgroundColor:C.surface,borderBottomWidth:1,borderBottomColor:C.border}}>
          <View style={{backgroundColor:C.card,borderRadius:14,flexDirection:'row',alignItems:'center',
            paddingHorizontal:14,borderWidth:1,borderColor:C.border,marginBottom:12}}>
            <Text style={{color:C.gray2,fontSize:16,marginRight:8}}>🔍</Text>
            <TextInput style={{flex:1,paddingVertical:13,color:C.white,fontSize:14}}
              placeholder={t('Subject or teacher name...','مضمون یا استاد کا نام...')}
              placeholderTextColor={C.gray3} value={search} onChangeText={setSearch}
              autoCorrect={false}/>
            {search.length>0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{color:C.gray2,fontSize:18}}>✕</Text></TouchableOpacity>}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATS.map((cat,i) => (
              <TouchableOpacity key={i} onPress={() => { haptic([25]); setSelCat(cat); }}
                style={{paddingHorizontal:14,paddingVertical:8,borderRadius:20,marginRight:8,
                  backgroundColor:selCat===cat?C.mint:C.card,borderWidth:1,
                  borderColor:selCat===cat?C.mint:C.border}}>
                <Text style={{color:selCat===cat?C.bg:C.gray2,fontSize:12,fontWeight:'700'}}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView contentContainerStyle={{padding:14}}>
          <Text style={{color:C.gray3,fontSize:11,marginBottom:12,letterSpacing:0.5}}>{approved.length} {t('TEACHERS FOUND','اساتذہ ملے')}</Text>
          {approved.map(tt => (
            <TouchableOpacity key={tt.id} onPress={() => { haptic([40]); setSelT(tt); go('teacherProfile'); }}>
              <NCard style={{padding:16,marginBottom:10}} glow={C.cyan}>
                <View style={{flexDirection:'row',gap:12}}>
                  <View style={{position:'relative'}}>
                    <View style={{width:56,height:56,borderRadius:17,backgroundColor:C.purple+'35',
                      alignItems:'center',justifyContent:'center',borderWidth:1.5,borderColor:C.purple}}>
                      <Text style={{color:C.purple,fontSize:24,fontWeight:'900'}}>{tt.name[0]}</Text>
                    </View>
                    {tt.available && <View style={{position:'absolute',bottom:1,right:1,width:13,height:13,
                      borderRadius:7,backgroundColor:C.mint,borderWidth:2,borderColor:C.bg}}/>}
                  </View>
                  <View style={{flex:1}}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                      <Text style={{color:C.white,fontSize:14,fontWeight:'900'}}>{tt.name}</Text>
                      {tt.verified && <Badge label="✅ Verified" color={C.mint} small/>}
                    </View>
                    <Stars rating={tt.rating} size={12}/>
                    <Text style={{color:C.gray2,fontSize:11,marginTop:2}}>{tt.degree}</Text>
                    <Text style={{color:C.mint,fontSize:12,marginTop:3,fontWeight:'700'}}>📚 {tt.subject} · {tt.level}</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:8,alignItems:'center'}}>
                      <Badge label={`Rs.${tt.fee}/${tt.pricingType}`} color={C.mint} small/>
                      <Text style={{color:C.gray3,fontSize:11}}>👥{tt.students} · ⭐{tt.reviews}</Text>
                    </View>
                  </View>
                </View>
              </NCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>
    );

    const renderProfile = () => (
      <ScrollView contentContainerStyle={{padding:18}}>
        <NCard style={{padding:22,alignItems:'center',marginBottom:16}} glow={C.cyan}>
          <View style={{width:80,height:80,borderRadius:24,backgroundColor:C.cyan+'28',
            alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:C.cyan,marginBottom:14}}>
            <Text style={{color:C.cyan,fontSize:36,fontWeight:'900'}}>A</Text>
          </View>
          <Text style={{color:C.white,fontSize:20,fontWeight:'900'}}>Ahmad Student</Text>
          <Text style={{color:C.gray2,fontSize:13,marginTop:3}}>Student Account</Text>
          <View style={{flexDirection:'row',gap:8,marginTop:14}}>
            <Badge label="✅ Verified" color={C.mint}/>
            <Badge label="🔥 7 Day Streak" color={C.orange}/>
          </View>
        </NCard>
        {[['🔔',t('Notifications','اطلاعات')],['🔒',t('Security','سیکیورٹی')],
          ['💳',t('Payment Methods','ادائیگی')],['📋',t('My Agreements','میرے معاہدے')],
          ['🔏',t('Privacy Policy','رازداری')],['❓',t('Help & Support','مدد')]].map(([ic,ti],i) => (
          <TouchableOpacity key={i} onPress={() => {
            if (ti.includes('Agreement') || ti.includes('معاہدے')) { setShowStudentAgreement(true); }
            else if (ti.includes('Privacy') || ti.includes('رازداری')) { setShowPrivacy(true); }
            else { toast('⚙️ '+ti+' — Coming Soon',C.purple); }
          }}>
            <NCard style={{padding:16,marginBottom:8,flexDirection:'row',alignItems:'center',gap:14}} glow={C.border}>
              <Text style={{fontSize:22}}>{ic}</Text>
              <Text style={{color:C.white,fontSize:14,fontWeight:'700',flex:1}}>{ti}</Text>
              <Text style={{color:C.gray3,fontSize:18}}>›</Text>
            </NCard>
          </TouchableOpacity>
        ))}
        <PBtn label={t('🚪 Logout','🚪 لاگ آؤٹ')} color={C.red} textColor={C.white} style={{marginTop:14}}
          onPress={() => Alert.alert(t('Logout?','لاگ آؤٹ؟'),'',[{text:t('Cancel','منسوخ')},{text:t('Logout','لاگ آؤٹ'),style:'destructive',onPress:()=>go('home')}])}/>
      </ScrollView>
    );

    return (
      <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
        <Wrap>
          <View style={[S.topBar,{backgroundColor:C.surface}]}>
            <View>
              <Text style={{color:C.gray2,fontSize:11}}>{t('Welcome back 👋','خوش آمدید 👋')}</Text>
              <Text style={{color:C.white,fontSize:17,fontWeight:'900',marginTop:1}}>Ahmad Student</Text>
            </View>
            <View style={{flexDirection:'row',gap:10,alignItems:'center'}}>
              <LangBtn/>
              <TouchableOpacity onPress={() => { toast('🔔 3 Notifications',C.mint); setNotifCount(0); }}
                style={{position:'relative'}}>
                <Text style={{fontSize:22}}>🔔</Text>
                {notifCount>0 && <View style={{position:'absolute',top:-2,right:-2,width:16,height:16,
                  borderRadius:8,backgroundColor:C.red,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:C.white,fontSize:9,fontWeight:'900'}}>{notifCount}</Text>
                </View>}
              </TouchableOpacity>
              <View style={S.avatar}><Text style={{color:C.bg,fontSize:15,fontWeight:'900'}}>A</Text></View>
            </View>
          </View>
          {sTab==='home' && renderHome()}
          {sTab==='search' && renderSearch()}
          {sTab==='classes' && (
            <ScrollView contentContainerStyle={{padding:18}}>
              <SLabel>{t('📚 Active Classes','📚 فعال کلاسز')}</SLabel>
              {[
                {sub:'Mathematics',teacher:'Ahmad Ali',time:'Mon–Thu 6–7 PM',fee:700,pricingType:'Per Month',link:'ST-MATH-A1'},
                {sub:'English',teacher:'Sara Khan',time:'Sat–Sun 5–6 PM',fee:250,pricingType:'Per Weekend',link:'ST-ENG-S4'},
              ].map((cls,i) => (
                <NCard key={i} style={{padding:16,marginBottom:12}} glow={C.mint}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <Text style={{color:C.white,fontSize:15,fontWeight:'900'}}>{cls.sub}</Text>
                    <Badge label="Active" color={C.mint} small/>
                  </View>
                  <Text style={{color:C.gray2,fontSize:12}}>👨‍🏫 {cls.teacher} · ⏰ {cls.time}</Text>
                  <View style={{flexDirection:'row',gap:6,marginTop:8}}>
                    <Badge label={'🔗 '+cls.link} color={C.cyan} small/>
                    <Badge label={`Rs.${cls.fee}/${cls.pricingType}`} color={C.mint} small/>
                  </View>
                  <View style={{flexDirection:'row',gap:10,marginTop:12}}>
                    <PBtn label="🎥 Join" color={C.mint} textColor={C.bg} size="sm" style={{flex:1}} onPress={()=>go('videoClass')}/>
                    <PBtn label="💳 Pay" color={C.purple} textColor={C.white} size="sm" style={{flex:1}} onPress={()=>go('payment')}/>
                  </View>
                </NCard>
              ))}
            </ScrollView>
          )}
          {sTab==='profile' && renderProfile()}
          <BottomNav active={sTab} onTab={setSTab} role="student"/>
        </Wrap>
      </SafeAreaView>
    );
  }

  // ── TEACHER PROFILE ─────────────────────────────────────
  if (screen === 'teacherProfile' && selT) return (
    <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <Wrap>
        <TopBar title={t('Teacher Profile','استاد پروفائل')} onBack={() => go('studentDash')} right={<LangBtn/>}/>
        <ScrollView contentContainerStyle={{padding:18}}>
          <NCard style={{padding:24,alignItems:'center',marginBottom:16}} glow={C.purple}>
            <View style={{width:90,height:90,borderRadius:28,backgroundColor:C.purple+'35',
              alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:C.purple,marginBottom:14}}>
              <Text style={{color:C.purple,fontSize:42,fontWeight:'900'}}>{selT.name[0]}</Text>
            </View>
            <Text style={{color:C.white,fontSize:21,fontWeight:'900',textAlign:'center'}}>{selT.name}</Text>
            <Text style={{color:C.mint,fontSize:13,marginTop:4,fontWeight:'700'}}>{selT.degree}</Text>
            <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>{selT.uni}</Text>
            <Stars rating={selT.rating} size={18}/>
            <Text style={{color:C.gold,fontSize:12,marginTop:4}}>{selT.rating} ({selT.reviews} reviews)</Text>
            <View style={{flexDirection:'row',gap:8,marginTop:14,flexWrap:'wrap',justifyContent:'center'}}>
              {selT.verified && <Badge label="✅ Verified" color={C.mint}/>}
              <Badge label="🔒 Secure" color={C.cyan}/>
              <Badge label={selT.experience} color={C.purple}/>
            </View>
          </NCard>

          <NCard style={{padding:18,marginBottom:14}} glow={C.cyan}>
            {[
              [t('📚 Subject','📚 مضمون'),selT.subject],
              [t('🎓 Level','🎓 سطح'),selT.level],
              [t('⏰ Timing','⏰ وقت'),selT.timing],
              [t('💰 Pricing','💰 قیمت'),`Rs.${selT.fee} ${t('per','فی')} ${selT.pricingType}`],
              [t('🏆 Experience','🏆 تجربہ'),selT.experience],
              [t('👥 Students','👥 طلبا'),selT.students+''],
            ].map(([l,v],i) => (
              <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:11,
                borderBottomWidth:i<5?1:0,borderBottomColor:C.border}}>
                <Text style={{color:C.gray2,fontSize:13}}>{l}</Text>
                <Text style={{color:C.white,fontSize:13,fontWeight:'700',flex:1,textAlign:'right',marginLeft:12}}>{v}</Text>
              </View>
            ))}
          </NCard>

          <NCard style={{padding:14,marginBottom:14,flexDirection:'row',gap:12}} glow={C.blue}>
            <Text style={{fontSize:20}}>🔒</Text>
            <Text style={{color:C.gray1,fontSize:12,flex:1,lineHeight:19}}>
              {t('Privacy Protected — Phone, WhatsApp or email is never visible. Sharing = instant permanent ban.',
                 'رازداری محفوظ — فون، واٹس ایپ کبھی نہیں دکھایا جائے گا۔ شیئر کرنا = فوری مستقل پابندی۔')}
            </Text>
          </NCard>

          <NCard style={{padding:22,alignItems:'center',marginBottom:18}} glow={C.mint}>
            <Text style={{color:C.gray2,fontSize:13}}>{t('Fee','فیس')} ({selT.pricingType})</Text>
            <Text style={{color:C.mint,fontSize:44,fontWeight:'900',marginTop:4}}>Rs.{selT.fee}</Text>
            {(() => {
              const calc = calcPayment(selT.fee, 'jazzcash');
              return <Text style={{color:C.gray3,fontSize:12,marginTop:6,textAlign:'center'}}>
                {t('Platform: Rs.','پلیٹ فارم: Rs.')}{calc.platformFee} · {t('Teacher receives: Rs.','استاد کو: Rs.')}{calc.teacherNet}
              </Text>;
            })()}
          </NCard>

          <PBtn label={`✅ ${t('Enroll','داخلہ')} — Rs.${selT.fee}/${selT.pricingType}`}
            color={C.mint} textColor={C.bg} onPress={() => go('payment')}/>
        </ScrollView>
      </Wrap>
    </SafeAreaView>
  );

  // ── PAYMENT ──────────────────────────────────────────────
  if (screen === 'payment') {
    const tt = selT || {name:'Ahmad Ali',subject:'Mathematics',fee:700,pricingType:'Per Month'};
    return (
      <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
        <Wrap>
          <TopBar title={t('💳 Secure Payment','💳 محفوظ ادائیگی')} onBack={() => go('teacherProfile')} right={<LangBtn/>}/>
          <ScrollView contentContainerStyle={{padding:18}}>
            <NCard style={{padding:16,marginBottom:16}} glow={C.cyan}>
              <Text style={{color:C.white,fontSize:15,fontWeight:'900'}}>{tt.name}</Text>
              <Text style={{color:C.gray2,fontSize:13,marginTop:4}}>{tt.subject} · {tt.pricingType}</Text>
            </NCard>

            <SLabel>{t('Select Payment Method','ادائیگی کا طریقہ')}</SLabel>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity key={m.id} onPress={() => { haptic([35]); setSelPay(m.id); }}>
                <NCard style={{padding:16,marginBottom:10,flexDirection:'row',alignItems:'center',gap:14,
                  borderColor:selPay===m.id?m.color:C.border,borderWidth:selPay===m.id?2:1}} glow={selPay===m.id?m.color:C.gray3}>
                  <Text style={{fontSize:30}}>{m.icon}</Text>
                  <View style={{flex:1}}>
                    <Text style={{color:C.white,fontSize:14,fontWeight:'800'}}>{m.name}</Text>
                    <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>
                      {m.fee===0 ? t('No processing fee','پروسیسنگ فیس نہیں') : `${(m.fee*100).toFixed(1)}% ${t('processing fee','پروسیسنگ فیس')}`}
                    </Text>
                  </View>
                  <View style={{width:22,height:22,borderRadius:11,borderWidth:2,
                    borderColor:selPay===m.id?m.color:C.gray3,alignItems:'center',justifyContent:'center'}}>
                    {selPay===m.id && <View style={{width:12,height:12,borderRadius:6,backgroundColor:m.color}}/>}
                  </View>
                </NCard>
              </TouchableOpacity>
            ))}

            {selPay && <PaymentBreakdown amount={tt.fee} method={selPay} pricingType={tt.pricingType}/>}

            <NCard style={{padding:14,marginBottom:18,flexDirection:'row',gap:12,alignItems:'center'}} glow={C.mint}>
              <Text style={{fontSize:18}}>🔒</Text>
              <Text style={{color:C.gray2,fontSize:12,flex:1}}>
                {t('100% Secure · SSL Encrypted · FBR Compliant','100% محفوظ · FBR کے مطابق')}
              </Text>
            </NCard>

            <PBtn label={`${t('Pay','ادا کریں')} Rs.${tt.fee} →`} color={C.mint} textColor={C.bg}
              disabled={!selPay} onPress={() => { haptic([80,40,200]); go('paySuccess'); }}/>
          </ScrollView>
        </Wrap>
      </SafeAreaView>
    );
  }

  // ── PAY SUCCESS ──────────────────────────────────────────
  if (screen === 'paySuccess') {
    const tt = selT || {name:'Ahmad Ali',fee:700,pricingType:'Per Month'};
    return (
      <SafeAreaView style={[S.flex,{backgroundColor:C.bg}]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
        <Wrap>
          <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:24}}>
            <View style={{width:130,height:130,borderRadius:40,backgroundColor:C.mint+'18',
              alignItems:'center',justifyContent:'center',marginBottom:26,borderWidth:2,borderColor:C.mint}}>
              <Text style={{fontSize:64}}>🎉</Text>
            </View>
            <Text style={{color:C.mint,fontSize:28,fontWeight:'900',textAlign:'center'}}>
              {t('Payment Successful!','ادائیگی کامیاب!')}
            </Text>
            <Text style={{color:C.gray2,fontSize:14,marginTop:10,marginBottom:24,textAlign:'center'}}>
              {t('Class link added to your dashboard','کلاس لنک آپ کے ڈیش بورڈ میں شامل')}
            </Text>
            {selPay && (() => {
              const calc = calcPayment(tt.fee, selPay);
              const m = PAYMENT_METHODS.find(x=>x.id===selPay);
              return (
                <NCard style={{padding:18,width:'100%',marginBottom:24}} glow={C.mint}>
                  {[
                    [t('Teacher','استاد'),tt.name],
                    [t('Amount Paid','ادا کی گئی رقم'),`Rs.${tt.fee} ✅`],
                    [t('Method','طریقہ'),m?.name||selPay],
                    [t('Platform Fee','پلیٹ فارم فیس'),`Rs.${calc.platformFee}`],
                    [t('Class Link','Class Link'),'ST-2025-NEW 🔗'],
                    [t('Valid','درست'),tt.pricingType],
                  ].map(([l,v],i)=>(
                    <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,
                      borderBottomWidth:i<5?1:0,borderBottomColor:C.border}}>
                      <Text style={{color:C.gray2,fontSize:13}}>{l}</Text>
                      <Text style={{color:C.white,fontSize:13,fontWeight:'800'}}>{v}</Text>
                    </View>
                  ))}
                </NCard>
              );
            })()}
            <PBtn label={t('Go to Dashboard →','ڈیش بورڈ پر جائیں →')} color={C.mint} textColor={C.bg}
              style={{width:'100%'}} onPress={() => go('studentDash')}/>
          </View>
        </Wrap>
      </SafeAreaView>
    );
  }

  // ── VIDEO CLASS ──────────────────────────────────────────
  if (screen === 'videoClass') return (
    <SafeAreaView style={[S.flex,{backgroundColor:'#000'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#000"/>
      <Wrap>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',
          padding:16,backgroundColor:'#111'}}>
          <View>
            <Text style={{color:C.white,fontSize:15,fontWeight:'900'}}>Mathematics — Class 9</Text>
            <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>Ahmad Ali · 18 students</Text>
          </View>
          <View style={{backgroundColor:C.red+'30',paddingHorizontal:10,paddingVertical:5,
            borderRadius:8,borderWidth:1,borderColor:C.red}}>
            <Text style={{color:C.red,fontWeight:'900',fontSize:12}}>🔴 LIVE {fmtTime(classTime)}</Text>
          </View>
        </View>

        <View style={{flex:1,backgroundColor:'#0A0A0A',position:'relative'}}>
          <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#111'}}>
            <View style={{width:110,height:110,borderRadius:34,backgroundColor:C.purple+'40',
              alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:C.purple}}>
              <Text style={{color:C.purple,fontSize:50,fontWeight:'900'}}>A</Text>
            </View>
            <Text style={{color:C.white,fontSize:16,fontWeight:'900',marginTop:14}}>Ahmad Ali (Teacher)</Text>
            <Text style={{color:C.gray2,fontSize:12,marginTop:4}}>🎤 Speaking...</Text>
          </View>
          <View style={{position:'absolute',top:14,right:14,width:90,height:120,
            backgroundColor:'#1A1A2E',borderRadius:14,alignItems:'center',justifyContent:'center',
            borderWidth:1.5,borderColor:C.mint}}>
            <Text style={{fontSize:28}}>😊</Text>
            <Text style={{color:C.white,fontSize:10,marginTop:6}}>You</Text>
          </View>
          {handRaised && (
            <View style={{position:'absolute',bottom:100,left:0,right:0,alignItems:'center'}}>
              <View style={{backgroundColor:C.gold+'EE',paddingHorizontal:20,paddingVertical:10,borderRadius:20}}>
                <Text style={{color:C.bg,fontWeight:'900'}}>✋ {t('Hand raised','ہاتھ اٹھایا')}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{backgroundColor:'#111',paddingVertical:16,paddingHorizontal:12}}>
          <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginBottom:14}}>
            {[
              {icon:micOn?'🎤':'🔇',label:micOn?'Mic On':'Muted',color:micOn?C.mint:C.red,onPress:()=>{setMicOn(p=>!p);haptic([30]);}},
              {icon:'📷',label:camOn?'Camera':'Off',color:camOn?C.cyan:C.red,onPress:()=>{setCamOn(p=>!p);haptic([30]);}},
              {icon:'✋',label:handRaised?'Hand Down':'Raise',color:handRaised?C.gold:C.gray2,onPress:()=>{setHandRaised(p=>!p);haptic([30,30]);}},
              {icon:'📋',label:'Board',color:C.blue,onPress:()=>go('whiteboard')},
              {icon:'✅',label:'Attend.',color:C.orange,onPress:()=>toast('✅ Attendance Marked!',C.mint)},
            ].map((btn,i) => (
              <TouchableOpacity key={i} onPress={btn.onPress} style={{alignItems:'center',gap:5}}>
                <View style={{width:50,height:50,borderRadius:15,backgroundColor:btn.color+'22',
                  alignItems:'center',justifyContent:'center',borderWidth:1.5,borderColor:btn.color+'55'}}>
                  <Text style={{fontSize:20}}>{btn.icon}</Text>
                </View>
                <Text style={{color:btn.color,fontSize:9,fontWeight:'700',textAlign:'center'}}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert(t('Leave Class?','کلاس چھوڑیں؟'),'',[{text:t('Stay','رہیں')},{text:t('Leave','چھوڑیں'),style:'destructive',onPress:()=>go('studentDash')}])}
            style={{backgroundColor:C.red,paddingVertical:14,borderRadius:16,alignItems:'center'}}>
            <Text style={{color:C.white,fontSize:15,fontWeight:'900'}}>📵 {t('Leave Class','کلاس چھوڑیں')}</Text>
          </TouchableOpacity>
        </View>
      </Wrap>
    </SafeAreaView>
  );

  // ── WHITEBOARD ───────────────────────────────────────────
  if (screen === 'whiteboard') return (
    <SafeAreaView style={[S.flex,{backgroundColor:'#0A0A1A'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A"/>
      <Wrap>
        <TopBar title={t('📋 Digital Whiteboard','📋 ڈیجیٹل بورڈ')} onBack={() => go('videoClass')}
          subtitle="Mathematics — Ahmad Ali"/>
        <View style={{flex:1,backgroundColor:'#F8F8FF',margin:16,borderRadius:20,
          alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:60}}>📋</Text>
          <Text style={{color:'#333',fontSize:16,fontWeight:'800',marginTop:16}}>Live Whiteboard</Text>
          <Text style={{color:'#666',fontSize:13,marginTop:8,textAlign:'center',paddingHorizontal:20}}>
            {t('Teacher is writing on the board...','استاد بورڈ پر لکھ رہا ہے...')}
          </Text>
          <View style={{flexDirection:'row',gap:10,marginTop:20}}>
            {[C.red,C.blue,'#00AA00','#000000'].map((col,i)=>(
              <View key={i} style={{width:32,height:32,borderRadius:16,backgroundColor:col,borderWidth:2,borderColor:'#ddd'}}/>
            ))}
          </View>
        </View>
        <View style={{padding:16,flexDirection:'row',gap:12}}>
          <GBtn label={t('📸 Screenshot Blocked','📸 اسکرین شاٹ بند')} color={C.red} style={{flex:1}}
            onPress={() => toast('🔒 '+t('Screenshot Blocked for Privacy','رازداری کے لیے اسکرین شاٹ بند'),C.red)}/>
          <PBtn label={t('← Back','← واپس')} color={C.purple} textColor={C.white} style={{flex:1}}
            onPress={() => go('videoClass')}/>
        </View>
      </Wrap>
    </SafeAreaView>
  );

  // ── TEACHER DASHBOARD ────────────────────────────────────
  if (screen === 'teacherDash') {
    const renderTHome = () => (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:18}}>
        <NCard style={{padding:16,marginBottom:16,flexDirection:'row',alignItems:'center',gap:12}} glow={C.mint}>
          <View style={{flex:1}}>
            <Text style={{color:C.mint,fontSize:14,fontWeight:'900'}}>✅ Subscription Active</Text>
            <Text style={{color:C.gray2,fontSize:12,marginTop:2}}>Trial · Month 2/3 Free</Text>
          </View>
          <TouchableOpacity onPress={() => go('teacherSubscription')}>
            <Badge label="Details →" color={C.mint}/>
          </TouchableOpacity>
        </NCard>

        <View style={{flexDirection:'row',gap:10,marginBottom:10}}>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:C.cyan+'35'}}>
            <Text style={{color:C.cyan,fontSize:20,fontWeight:'900'}}>45</Text>
            <Text style={{color:C.gray2,fontSize:10,marginTop:4}}>{t('Students','طلبا')}</Text>
          </View>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderWidth:1,borderColor:C.mint+'35'}}>
            <Text style={{color:C.mint,fontSize:20,fontWeight:'900'}}>Rs.27k</Text>
            <Text style={{color:C.gray2,fontSize:10,marginTop:4}}>{t('This Month','اس ماہ')}</Text>
          </View>
          <View style={{flex:1,backgroundColor:C.card,borderRadius:16,padding:16,alignItems:'center',borderW
