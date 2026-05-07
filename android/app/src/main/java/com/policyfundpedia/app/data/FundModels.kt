package com.policyfundpedia.app.data

enum class FundCategory(val label: String) {
    SmallBusiness("소상공인"),
    Startup("창업"),
    Sme("중소기업"),
    Employment("고용"),
    Personal("비사업자")
}

enum class ApplicantType(val label: String) {
    BusinessOwner("사업자"),
    PreFounder("예비창업자"),
    Employer("고용주"),
    Individual("개인")
}

data class FundProgram(
    val id: String,
    val title: String,
    val category: FundCategory,
    val applicantTypes: List<ApplicantType>,
    val agency: String,
    val amount: String,
    val rate: String,
    val period: String,
    val deadline: String,
    val summary: String,
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
