import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Award, ThumbsUp, 
  Clock, ShieldCheck, Verified, 
  ArrowRight, Target, Heart
} from 'lucide-react';

const AboutPage = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Martin Dupuis',
      role: 'Directeur général',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      description: '15 ans d\'expérience dans le secteur du froid commercial.'
    },
    {
      name: 'Sophie Leclerc',
      role: 'Responsable technique',
      image: 'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg',
      description: 'Experte en systèmes de climatisation et VMC industriels.'
    },
    {
      name: 'Thomas Petit',
      role: 'Ingénieur HACCP',
      image: 'https://images.pexels.com/photos/3778680/pexels-photo-3778680.jpeg',
      description: 'Spécialiste des normes et réglementations de sécurité alimentaire.'
    },
    {
      name: 'Julie Moreau',
      role: 'Responsable commercial',
      image: 'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg',
      description: 'Élabore des solutions adaptées aux besoins de chaque client.'
    }
  ];

  // Timeline/History data
  const historyTimeline = [
    {
      year: '2010',
      title: 'Création de ZEFREEZE',
      description: 'Fondation de l\'entreprise avec une équipe de 5 techniciens spécialisés dans le froid commercial.'
    },
    {
      year: '2013',
      title: 'Expansion VMC',
      description: 'Élargissement des services pour inclure les solutions de ventilation mécanique contrôlée.'
    },
    {
      year: '2016',
      title: 'Certification HACCP',
      description: 'Obtention des certifications et début des prestations de mise en conformité HACCP.'
    },
    {
      year: '2019',
      title: 'Développement national',
      description: 'Ouverture de bureaux régionaux et expansion de l\'équipe à 25 techniciens.'
    },
    {
      year: '2022',
      title: 'Plateforme numérique',
      description: 'Lancement de la plateforme de gestion des interventions et suivi client en temps réel.'
    },
    {
      year: '2025',
      title: 'Innovation continue',
      description: 'Mise en place de nouvelles solutions connectées pour la surveillance des installations.'
    }
  ];

  // Values/Commitments data
  const values = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
      title: 'Qualité',
      description: 'Nous nous engageons à fournir des services et des produits de la plus haute qualité, sans compromis.'
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: 'Réactivité',
      description: 'Notre équipe est disponible 24h/24 pour répondre rapidement à toutes les situations d\'urgence.'
    },
    {
      icon: <Verified className="h-8 w-8 text-blue-600" />,
      title: 'Expertise',
      description: 'Nos techniciens sont hautement qualifiés et formés en continu aux dernières technologies.'
    },
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Nous recherchons constamment de nouvelles solutions pour améliorer l\'efficacité et la durabilité.'
    },
    {
      icon: <Heart className="h-8 w-8 text-blue-600" />,
      title: 'Durabilité',
      description: 'Nous privilégions les solutions respectueuses de l\'environnement et économes en énergie.'
    },
    {
      icon: <ThumbsUp className="h-8 w-8 text-blue-600" />,
      title: 'Satisfaction client',
      description: 'Votre satisfaction est notre priorité absolue, nous nous adaptons à vos besoins spécifiques.'
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">À propos de ZEFREEZE</h1>
              <p className="text-xl text-gray-600 mb-6">
                Depuis 2010, ZEFREEZE s'est imposé comme un leader dans le domaine du froid commercial, 
                de la VMC et de la conformité HACCP pour les professionnels de l'alimentation.
              </p>
              <p className="text-xl text-gray-600 mb-8">
                Notre mission est d'assurer la qualité et la conformité de vos installations frigorifiques 
                et de ventilation, tout en vous accompagnant dans le respect des normes de sécurité alimentaire.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">30+</div>
                    <div className="text-gray-600">Experts techniques</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15</div>
                    <div className="text-gray-600">Années d'expérience</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <ThumbsUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-gray-600">Clients satisfaits</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img 
                src="https://images.pexels.com/photos/3775126/pexels-photo-3775126.jpeg" 
                alt="L'équipe ZEFREEZE" 
                className="rounded-xl shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ces principes fondamentaux guident chacune de nos actions et décisions 
              afin de vous offrir un service d'excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md flex flex-col">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                </div>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our History */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre histoire</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment ZEFREEZE a évolué pour devenir un acteur majeur 
              dans le domaine du froid commercial et de la conformité.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>

            <div className="space-y-12">
              {historyTimeline.map((item, index) => (
                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 mb-8 md:mb-0">
                    <div className={`md:max-w-md ${index % 2 === 0 ? 'md:ml-auto md:pr-12' : 'md:mr-auto md:pl-12'}`}>
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-lg font-semibold text-blue-600 mb-2">{item.year}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-12 flex justify-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                      {index + 1}
                    </div>
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre équipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rencontrez les personnes passionnées qui rendent possible l'excellence de nos services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez la famille ZEFREEZE</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Découvrez comment nos solutions peuvent transformer votre entreprise 
            et assurer la conformité de vos installations.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 transition-colors"
          >
            Contactez-nous
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;