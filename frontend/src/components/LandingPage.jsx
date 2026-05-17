
import React, { useEffect, useState } from 'react';
import { Video, ChevronRight, Activity, Star, Pill, Truck } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { getUiCopy } from '../i18n/uiCopy';

// Use the local path or the embedded artifact logic for the mocked image
const DASHBOARD_IMAGE = "/sehat_sahayak_app_dashboard_mockup.png";

// --- Sub Components ---

const WordRotator = ({ words, className }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000); // Change word every 3 seconds
        return () => clearInterval(interval);
    }, [words]);

    return (
        <span className="inline-block relative">
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute left-0 top-0 whitespace-nowrap ${className}`}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
            {/* Invisible placeholder to keep width correct */}
            <span className={`opacity-0 whitespace-nowrap ${className}`}>{words[0]}</span>
        </span>
    );
};

const StatsCounter = ({ end, suffix }) => {
    const [isInView, setIsInView] = useState(false);

    return (
        <motion.span
            onViewportEnter={() => setIsInView(true)}
            onViewportLeave={() => setIsInView(false)} // Reset when out of view
        >
            <CounterValue start={0} end={end} duration={2} isInView={isInView} />
            {suffix}
        </motion.span>
    );
};

const CounterValue = ({ start, end, duration, isInView }) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
        if (!isInView) {
            setCount(start); // Reset count when out of view
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
            setCount(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [start, end, duration, isInView]);

    return <>{count}</>;
}


const ParallaxFloatingElement = ({ children, speed = 1, className, top, left, right, bottom }) => {
    const { scrollY } = useScroll();
    const yRange = useTransform(scrollY, [0, 1000], [0, 200 * speed]);

    return (
        <motion.div
            style={{ y: yRange, top, left, right, bottom }}
            className={`absolute ${className}`}
        >
            {children}
        </motion.div>
    );
};

const FeatureCard = ({ icon, title, desc, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        teal: 'bg-teal-50 text-teal-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600'
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{
                scale: 1.05,
                y: -10,
                rotate: 1,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg transition-all duration-300 group cursor-pointer"
        >
            <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 rounded-2xl ${colors[color]} flex items-center justify-center mb-6`}
            >
                {icon}
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
};

const StepRow = ({ step, title, desc }) => {
    const stepVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
    };

    return (
        <motion.div
            variants={stepVariants}
            className="flex gap-6 p-4 rounded-2xl hover:bg-white/60 transition-colors"
        >
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center font-bold text-slate-400 bg-white shadow-sm">
                {step}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-500">{desc}</p>
            </div>
        </motion.div>
    )
};

const TestimonialCard = ({ name, loc, text, stars }) => {
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, rotate: -2 },
        visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, type: "spring" } }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-left hover:bg-white hover:shadow-xl transition-all shadow-sm"
        >
            <div className="flex gap-1 text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} className={i >= stars ? "text-slate-300" : ""} />
                ))}
            </div>
            <p className="text-slate-700 italic mb-6">"{text}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {name[0]}
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{loc}</p>
                </div>
            </div>
        </motion.div>
    );
};

// --- Landing Page Component ---

const LandingPage = ({ language = 'en', onLanguageChange, onLoginClick, onRegisterClick }) => {
    const ui = getUiCopy(language).landing;
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation Variants
    // Note: removed viewport={{ once: true }} to enable continuous re-animation
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans text-slate-900 overflow-x-hidden relative">

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600 origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* --- Navbar --- */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.6 }}
                            className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200 cursor-pointer"
                        >
                            <span className="font-bold text-xl md:text-2xl">+</span>
                        </motion.div>
                        <span className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-blue-700">
                            SehatSahayak
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 lg:gap-8 font-medium text-slate-600 text-sm lg:text-base">
                        {ui.nav.map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-teal-600 transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <LanguageSwitcher language={language} onChange={onLanguageChange} compact />
                        <button
                            onClick={onLoginClick}
                            className="text-slate-600 font-semibold hover:text-teal-600 transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {ui.signIn}
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRegisterClick}
                            className="px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-full transition-all text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {ui.getStarted}
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* --- Hero Section --- */}
            <header id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-32 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ amount: 0.3 }} // Re-triggers when 30% visible
                    variants={staggerContainer}
                    className="space-y-6 md:space-y-8 z-20"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-full text-xs md:text-sm mb-2 border border-blue-100 shadow-sm">
                        {ui.trustBadge}
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
                        Healthcare made <br />
                        <span className="block h-[1.3em]">
                            <WordRotator
                                words={ui.heroWords}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600"
                            />
                        </span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-500 max-w-lg leading-relaxed">{ui.heroDescription}</motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.05, translateY: -4, boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRegisterClick}
                            className="px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {ui.primaryCta} <ChevronRight size={20} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, translateY: -4, backgroundColor: "#f8fafc" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 md:px-8 md:py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm md:text-base"
                        >
                            <Video size={20} className="text-teal-500" /> {ui.secondaryCta}
                        </motion.button>
                    </motion.div>

                    {/* Localization Badges */}
                    <motion.div variants={fadeInUp} className="pt-8 border-t border-slate-200/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{ui.partnersTitle}</p>
                        <div className="flex flex-wrap items-center gap-6 md:gap-8 opacity-70 grayscale hover:grayscale-0 transition-all hover:opacity-100">
                            <span className="font-bold text-slate-600 text-base md:text-lg hover:text-blue-600 transition-colors cursor-default">Apollo <span className="text-orange-500">24|7</span></span>
                            <span className="font-bold text-slate-600 text-base md:text-lg hover:text-blue-600 transition-colors cursor-default">Practo</span>
                            <span className="font-bold text-slate-600 text-base md:text-lg hover:text-blue-600 transition-colors cursor-default">1mg</span>
                            <span className="font-bold text-blue-800 text-base md:text-lg hover:text-blue-600 transition-colors cursor-default">NDTV</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Hero Image */}
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ amount: 0.3 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="relative z-10 hidden md:block"
                >
                    <div className="relative w-full max-w-sm md:max-w-[320px] lg:max-w-lg mx-auto md:ml-auto md:mr-0 animate-float-slow">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-200 to-blue-200 rounded-full blur-[100px] opacity-40 -z-10 animate-pulse"></div>
                            <img
                                src="/doctor_hero_unique.png"
                                alt="SehatSahayak Doctor"
                                className="w-full h-auto drop-shadow-2xl mix-blend-multiply"
                                style={{ maskImage: 'radial-gradient(circle, black 60%, transparent 95%)', WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 95%)' }}
                            />
                        </div>
                        {/* Floating Badge */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="absolute bottom-10 -left-2 lg:-left-10"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">{ui.activeDoctors}</p>
                                    <p className="text-lg font-bold text-slate-900">2,500+</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </header>

            {/* --- Features Grid --- */}
            <section id="features" className="py-24 bg-white relative overflow-hidden z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center mb-16 max-w-2xl mx-auto"
                    >
                        <motion.span variants={fadeInUp} className="text-teal-600 font-bold tracking-wider uppercase text-sm bg-teal-50 px-3 py-1 rounded-full">{ui.servicesTag}</motion.span>
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">{ui.servicesTitle}</motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 text-lg">{ui.servicesSubtitle}</motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.1 }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-4 gap-8"
                    >
                        <FeatureCard icon={<Video size={32} />} title={ui.services[0].title} desc={ui.services[0].desc} color="blue" />
                        <FeatureCard icon={<Pill size={32} />} title={ui.services[1].title} desc={ui.services[1].desc} color="teal" />
                        <FeatureCard icon={<Activity size={32} />} title={ui.services[2].title} desc={ui.services[2].desc} color="orange" />
                        <FeatureCard icon={<Truck size={32} />} title={ui.services[3].title} desc={ui.services[3].desc} color="red" />
                    </motion.div>
                </div>
            </section>

            {/* --- How It Works --- */}
            <section id="how-it-works" className="py-24 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ amount: 0.3 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="order-2 lg:order-1 relative"
                        >
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 rounded-[3rem] overflow-hidden relative shadow-2xl">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-9xl text-white/50 font-black">1-2-3</div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 glass-effect m-8 rounded-3xl border border-white/50 backdrop-blur-md">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                                        <h3 className="text-xl font-bold">{ui.heroSteps[0]}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shadow-md">2</div>
                                        <h3 className="text-xl font-bold">{ui.heroSteps[1]}</h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shadow-md">3</div>
                                        <h3 className="text-xl font-bold">{ui.heroSteps[2]}</h3>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ amount: 0.3 }}
                            variants={staggerContainer}
                            className="order-1 lg:order-2 space-y-8"
                        >
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-extrabold text-slate-900">
                                {ui.howTitle}
                            </motion.h2>
                            <div className="space-y-6">
                                {ui.steps.map((item) => (
                                    <StepRow key={item.step} step={item.step} title={item.title} desc={item.desc} />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Testimonials --- */}
            <section id="reviews" className="py-24 bg-white z-20 relative">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold mb-12"
                    >
                        {ui.testimonialsTitleLead} <span className="text-blue-600"><StatsCounter end={10} suffix=" Lakh+" /></span> {ui.testimonialsTitleSuffix}
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.2 }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        <TestimonialCard name={ui.testimonials[0].name} loc={ui.testimonials[0].location} text={ui.testimonials[0].text} stars={5} />
                        <TestimonialCard name={ui.testimonials[1].name} loc={ui.testimonials[1].location} text={ui.testimonials[1].text} stars={5} />
                        <TestimonialCard name={ui.testimonials[2].name} loc={ui.testimonials[2].location} text={ui.testimonials[2].text} stars={4} />
                    </motion.div>
                </div>
            </section>

            {/* --- CTA Footer --- */}
            <footer className="bg-slate-900 text-white pt-24 pb-12 rounded-t-[3rem] mt-12 relative z-30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xl">+</span> SehatSahayak
                            </h3>
                            <p className="text-slate-400 max-w-sm">{ui.footerDescription}</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">{ui.quickLinks}</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Doctors</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Lab Tests</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">{ui.support}</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                        © 2026 SehatSahayak. Made for India ❤️
                    </div>
                </div>
            </footer>

            {/* --- Floating Background Elements with Parallax --- */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <ParallaxFloatingElement speed={0.5} top="15%" left="5%" className="text-blue-200/40">
                    <Activity size={48} />
                </ParallaxFloatingElement>
                <ParallaxFloatingElement speed={0.8} top="25%" right="10%" className="text-teal-200/40">
                    <Pill size={64} />
                </ParallaxFloatingElement>
                <ParallaxFloatingElement speed={0.3} top="60%" left="15%" className="text-indigo-200/30">
                    <div className="text-6xl font-black opacity-20">+</div>
                </ParallaxFloatingElement>
                <ParallaxFloatingElement speed={1.2} top="85%" right="20%" className="text-blue-100">
                    <div className="w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
                </ParallaxFloatingElement>
            </div>

        </div>
    );
};

export default LandingPage;
