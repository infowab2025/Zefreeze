import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Snowflake, 
  Fan, 
  ClipboardCheck, 
  Clock, 
  Award, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                Experts en froid commercial, VMC et conformité HACCP
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Solutions complètes et professionnelles pour la gestion des interventions 
                techniques dans les domaines du froid commercial, de la VMC et de la conformité HACCP.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                >
                  Nos services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/442154/pexels-photo-442154.jpeg" 
                alt="Technician working" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos services spécialisés</h2>
            <p className="text-xl text-gray-600">
              ZEFREEZE offre une gamme complète de services pour répondre à vos besoins 
              en matière de froid commercial, VMC et conformité HACCP.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-blue-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Snowflake className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Froid Commercial</h3>
              <p className="text-gray-600 mb-4">
                Installation, maintenance et réparation de systèmes frigorifiques pour 
                commerces, restaurants et industries alimentaires.
              </p>
              <Link 
                to="/services" 
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Service 2 */}
            <div className="bg-blue-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Fan className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">VMC</h3>
              <p className="text-gray-600 mb-4">
                Solutions de ventilation mécanique contrôlée pour assurer une qualité 
                d'air optimale dans vos espaces professionnels.
              </p>
              <Link 
                to="/services" 
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Service 3 */}
            <div className="bg-blue-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conformité HACCP</h3>
              <p className="text-gray-600 mb-4">
                Audit, conseil et mise en conformité avec les normes HACCP pour assurer 
                la sécurité alimentaire de votre établissement.
              </p>
              <Link 
                to="/services" 
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir ZEFREEZE?</h2>
            <p className="text-xl text-gray-600">
              Notre expertise et notre approche client-centrée nous permettent de délivrer 
              des services de qualité supérieure.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Réactivité</h3>
              <p className="text-gray-600">
                Intervention rapide en cas d'urgence avec des délais optimisés.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expertise</h3>
              <p className="text-gray-600">
                Techniciens qualifiés et formés aux dernières technologies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conformité</h3>
              <p className="text-gray-600">
                Respect rigoureux des normes en vigueur et documentation complète.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support client</h3>
              <p className="text-gray-600">
                Accompagnement personnalisé et suivi régulier de vos installations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold mb-4">Prêt à optimiser vos installations?</h2>
              <p className="text-xl text-blue-100">
                Contactez-nous dès aujourd'hui pour une évaluation personnalisée 
                et un devis adapté à vos besoins.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que nos clients disent</h2>
            <p className="text-xl text-gray-600">
              Découvrez les témoignages de nos clients satisfaits qui nous font confiance 
              pour leurs installations frigorifiques et VMC.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg" 
                    alt="Restaurant manager" 
                    className="h-12 w-12 rounded-full" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sophie Martin</h4>
                  <p className="text-gray-600 text-sm">Restaurant Le Provençal</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "L'équipe de ZEFREEZE a répondu rapidement à notre urgence et a réparé notre 
                système de réfrigération en un temps record. Un service impeccable et professionnel."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" 
                    alt="Supermarket director" 
                    className="h-12 w-12 rounded-full" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pierre Dubois</h4>
                  <p className="text-gray-600 text-sm">Supermarché FraisMart</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Nous travaillons avec ZEFREEZE depuis 3 ans pour la maintenance de nos équipements 
                frigorifiques. Leur rapport HACCP nous aide à maintenir nos standards de qualité."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/5615665/pexels-photo-5615665.jpeg" 
                    alt="Hotel manager" 
                    className="h-12 w-12 rounded-full" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Claire Leroy</h4>
                  <p className="text-gray-600 text-sm">Hôtel Le Méridien</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "La nouvelle installation VMC réalisée par ZEFREEZE a considérablement amélioré 
                la qualité de l'air dans notre établissement. Nos clients ont remarqué la différence!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;