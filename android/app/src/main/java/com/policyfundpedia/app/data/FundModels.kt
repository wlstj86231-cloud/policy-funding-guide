package com.policyfundpedia.app.data

enum class FundCategory(val label: String) {
    SmallBusiness("????"),
    Startup("??"),
    Sme("????"),
    Employment("??"),
    Personal("????")
}

enum class ApplicantType(val label: String) {
    BusinessOwner("???"),
    PreFounder("?????"),
    Employer("???"),
    Individual("????")
}

data class FundProgram(
    val id: String,
    val title: String,
    val category: FundCategory,
    val applicantTypes: List<ApplicantType>,
    val tags: List<String>,
    val agency: String,
    val agencyName: String,
    val agencyNote: String,
    val amount: String,
    val rate: String,
    val period: String,
    val deadline: String,
    val updated: String,
    val summary: String,
    val detail: String,
    val target: String,
    val steps: List<String>,
    val documents: List<String>,
    val note: String,
    val officialUrl: String
)

data class CategorySummary(
    val category: FundCategory,
    val count: Int,
    val headline: String
)
