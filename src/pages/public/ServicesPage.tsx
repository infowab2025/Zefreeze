import React from 'react';
import { Link } from 'react-router-dom';
import {
  Snowflake,
  Fan,
  ClipboardCheck,
  Wrench,
  Thermometer,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';

const ServicesPage = () => {
  // Define services data
  const mainServices = [
    {
      icon: <Snowflake className="h-12 w-12 text-blue-600" />,
      title: 'Froid Commercial',
      description: 'Installation, maintenance et réparation de systèmes frigorifiques pour commerces, restaurants et industries alimentaires.',
      details: [
        'Chambres froides positives et négatives',
        'Vitrines réfrigérées',
        'Armoires frigorifiques',
        'Détection et réparation de fuites',
        'Recharge en fluide frigorigène',
        'Optimisation énergétique'
      ]
    },
    {
      icon: <Fan className="h-12 w-12 text-green-600" />,
      title: 'VMC',
      description: 'Solutions de ventilation mécanique contrôlée pour assurer une qualité d\'air optimale dans vos espaces professionnels.',
      details: [
        'VMC simple et double flux',
        'Ventilation cuisine professionnelle',
        'Filtration et purification d\'air',
        'Systèmes de récupération d\'énergie',
        'Gestion des flux d\'air',
        'Réduction des odeurs'
      ]
    },
    {
      icon: <ClipboardCheck className="h-12 w-12 text-purple-600" />,
      title: 'Conformité HACCP',
      description: 'Audit, conseil et mise en conformité avec les normes HACCP pour assurer la sécurité alimentaire de votre établissement.',
      details: [
        'Audits de conformité',
        'Documentation réglementaire',
        'Contrôle des températures',
        'Analyse des points critiques',
        'Formation du personnel',
        'Rapports de conformité'
      ]
    }
  ];

  // Define secondary services
  const otherServices = [
    {
      icon: <Wrench className="h-8 w-8 text-blue-600" />,
      title: 'Maintenance Préventive',
      description: 'Programmes de maintenance régulière pour prévenir les pannes et optimiser la durée de vie de vos équipements.'
    },
    {
      icon: <Clock className="h-8 w-8 text-red-600" />,
      title: 'Interventions d\'Urgence',
      description: 'Service d\'intervention rapide 24h/24 et 7j/7 pour les pannes critiques affectant vos installations frigorifiques.'
    },
    {
      icon: <Thermometer className="h-8 w-8 text-orange-600" />,
      title: 'Optimisation Énergétique',
      description: 'Audit et solutions pour réduire la consommation énergétique de vos installations de froid et de ventilation.'
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-green-600" />,
      title: 'Contrôles Réglementaires',
      description: 'Vérification périodique de la conformité aux normes et réglementations en vigueur pour vos installations.'
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Services Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ZEFREEZE propose une gamme complète de services professionnels pour le froid commercial, 
            la VMC et la conformité HACCP, adaptés aux besoins des commerces et industries alimentaires.
          </p>
        </div>

        {/* Main Services */}
        <div className="space-y-24 mb-24">
          {mainServices.map((service, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} gap-12`}>
              <div className="lg:w-1/2">
                <div className={`bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500 to-blue-700' :
                  index === 1 ? 'from-green-500 to-green-700' :
                  'from-purple-500 to-purple-700'
                } p-12 rounded-xl shadow-xl aspect-video flex items-center justify-center`}>
                  {service.icon}
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  } mr-3`}>
                    {React.cloneElement(service.icon, { className: 'h-5 w-5' })}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{service.title}</h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {service.details.map((detail, i) => (
                    <li key={i} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 ${
                        index === 0 ? 'text-blue-500' :
                        index === 1 ? 'text-green-500' :
                        'text-purple-500'
                      } mt-1 mr-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    index === 0 ? 'bg-blue-600 hover:bg-blue-700' :
                    index === 1 ? 'bg-green-600 hover:bg-green-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  } transition-colors`}
                >
                  Demander un devis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Services additionnels</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En complément de nos services principaux, nous proposons également ces prestations 
              pour répondre à l'ensemble de vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherServices.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>
                <Link
                  to="/contact"
                  className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                >
                  En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-xl shadow-lg p-10 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir ZEFREEZE ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre expertise, notre engagement et notre approche personnalisée font de nous 
              le partenaire idéal pour toutes vos installations techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Expertise certifiée</h3>
              <p className="text-gray-600">
                Nos techniciens sont certifiés et formés régulièrement aux dernières technologies.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Réactivité maximale</h3>
              <p className="text-gray-600">
                Intervention rapide garantie en cas d'urgence pour limiter les pertes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Garantie qualité</h3>
              <p className="text-gray-600">
                Tous nos travaux sont garantis et suivis pour assurer votre satisfaction.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Thermometer className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Solutions durables</h3>
              <p className="text-gray-600">
                Nous privilégions les solutions économes en énergie et respectueuses de l'environnement.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white rounded-xl shadow-lg p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à améliorer vos installations ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Contactez-nous dès aujourd'hui pour discuter de vos besoins 
            et obtenir un devis personnalisé pour vos installations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
            >
              Demander un devis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="tel:+33123456789"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              +33 1 23 45 67 89
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Phone = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default ServicesPage;